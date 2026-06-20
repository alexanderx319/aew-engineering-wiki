import type { AEWState, SectionId, SearchHit } from "./types";

export function buildSearchHits(state: AEWState, query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const catById = new Map(state.categories.map((c) => [c.id, c] as const));
  const hits: SearchHit[] = [];

  // Wiki categories
  for (const cat of state.categories) {
    if (`${cat.name} ${cat.description}`.toLowerCase().includes(q)) {
      hits.push({ section: "wiki", kind: "category", id: cat.id, title: cat.name, subtitle: "Categoría", excerpt: cat.description || "Sin descripción." });
    }
  }

  // Wiki articles
  for (const article of state.articles) {
    const category = catById.get(article.categoryId);
    if ([article.title, article.tags.join(" "), article.content, category?.name ?? ""].join(" ").toLowerCase().includes(q)) {
      hits.push({ section: "wiki", kind: "article", id: article.id, title: article.title, subtitle: `Artículo · ${category?.name ?? "Sin categoría"}`, excerpt: article.content.replace(/\s+/g, " ").slice(0, 132) || "Sin contenido." });
    }
  }

  // Bugs
  for (const bug of state.bugs) {
    if ([bug.title, bug.cause, bug.solution, bug.project, bug.status].join(" ").toLowerCase().includes(q)) {
      hits.push({ section: "bugs", kind: "bug", id: bug.id, title: bug.title, subtitle: `Bug · ${bug.project}`, excerpt: bug.cause });
    }
  }

  // Experiments
  for (const e of state.experiments) {
    if ([e.title, e.tags.join(" "), e.summary, e.hypothesis, e.result, e.conclusion, e.status].join(" ").toLowerCase().includes(q)) {
      hits.push({ section: "experiments", kind: "experiment", id: e.id, title: e.title, subtitle: `Experimento · ${e.status}`, excerpt: e.summary || e.conclusion || "Sin resumen." });
    }
  }

  // Snippets
  for (const s of state.snippets) {
    if ([s.title, s.language, s.tags.join(" "), s.description, s.code].join(" ").toLowerCase().includes(q)) {
      hits.push({ section: "code", kind: "snippet", id: s.id, title: s.title, subtitle: `Snippet · ${s.language}`, excerpt: s.description || s.code.slice(0, 132) || "Sin descripción." });
    }
  }

  // Custom sections
  for (const entry of state.customEntries) {
    const section = state.customSections.find((s) => s.id === entry.sectionId);
    if (!section) continue;
    const fieldValues = Object.values(entry.fields).join(" ");
    if ([entry.title, entry.content, entry.tags.join(" "), fieldValues].join(" ").toLowerCase().includes(q)) {
      const firstAccent = section.fields.find((f) => f.accentField || f.showInList);
      const subtitle    = firstAccent ? entry.fields[firstAccent.id] ?? section.name : section.name;
      hits.push({
        section:  entry.sectionId,
        kind:     "customEntry",
        id:       entry.id,
        title:    entry.title,
        subtitle: `${section.icon} ${section.name} · ${subtitle}`,
        excerpt:  entry.content.slice(0, 132) || fieldValues.slice(0, 132) || "Sin contenido.",
      });
    }
  }

  const sectionOrder = (id: SectionId): number => {
    const fixed: Record<string, number> = { dashboard: 0, wiki: 1, bugs: 2, experiments: 3, code: 4 };
    return fixed[id as string] ?? 5;
  };

  return hits
    .sort((a, b) => sectionOrder(a.section) - sectionOrder(b.section) || a.title.localeCompare(b.title, "es"))
    .slice(0, 28);
}
