import { STORAGE_KEY, DEFAULT_CATEGORIES } from "./constants";
import { uid, today } from "./utils";
import type {
  AEWState, Category, Article, Bug, Experiment, Snippet,
  CustomSection, CustomEntry, FieldSchema, SectionContentMode, FieldType,
} from "./types";

// ─── Seed data ────────────────────────────────────────────────────────────────

export function createDefaultState(): AEWState {
  const linuxId = DEFAULT_CATEGORIES[0].id;
  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    articles: [
      {
        id: "lrc-vis",
        title: "lrc-vis en Arch Linux + Hyprland",
        tags: ["Arch", "Hyprland", "mpv", "MPRIS", "Python"],
        date: "Jun 10, 2026",
        updatedAt: "Jun 10, 2026",
        categoryId: linuxId,
        content: `## Problema\nlrc-vis abría ventana pero solo mostraba "..." — nunca aparecían letras.\n\n## Causa raíz\nVLC no exponía xesam:title vía MPRIS.\n\n## Fix\n\`\`\`\nfrom urllib.parse import unquote\nreturn Path(unquote(url[7:]))\n\`\`\``,
      },
    ],
    bugs: [
      {
        id: "BUG-001",
        title: "lrc-vis no mostraba letras — URL encoding",
        cause: "lrc-vis no decodificaba %20 y %C3%BA en la ruta del archivo de audio",
        solution: "Fix en visualizer_player.py usando urllib.parse.unquote(url[7:])",
        project: "Linux Lab",
        date: "Jun 10, 2026",
        status: "Resuelto",
      },
    ],
    experiments:    [],
    snippets:       [],
    customSections: [],
    customEntries:  [],
  };
}

// ─── Normalization (defensive deserialization) ────────────────────────────────

function normalizeFieldSchema(f: unknown): FieldSchema | null {
  if (!f || typeof f !== "object") return null;
  const obj = f as Record<string, unknown>;
  const VALID_TYPES: FieldType[] = ["text","textarea","number","select","tags","url","date","rating","status","code"];
  const type = VALID_TYPES.includes(obj.type as FieldType) ? (obj.type as FieldType) : "text";
  return {
    id:          typeof obj.id    === "string" ? obj.id    : uid("fld"),
    label:       typeof obj.label === "string" ? obj.label : "Campo",
    type,
    placeholder: typeof obj.placeholder === "string" ? obj.placeholder : undefined,
    options:     Array.isArray(obj.options) ? obj.options.filter((o): o is string => typeof o === "string") : undefined,
    required:    obj.required === true,
    showInList:  obj.showInList !== false,
    accentField: obj.accentField === true,
  };
}

function normalizeCustomSection(s: unknown, index: number): CustomSection | null {
  if (!s || typeof s !== "object") return null;
  const obj = s as Record<string, unknown>;
  const VALID_MODES: SectionContentMode[] = ["collection", "notes", "both"];
  const mode = VALID_MODES.includes(obj.mode as SectionContentMode) ? (obj.mode as SectionContentMode) : "both";
  const fields = Array.isArray(obj.fields)
    ? obj.fields.map(normalizeFieldSchema).filter((f): f is FieldSchema => f !== null)
    : [];
  return {
    id:          typeof obj.id          === "string" ? obj.id          : uid("sec"),
    name:        typeof obj.name        === "string" ? obj.name        : `Sección ${index + 1}`,
    icon:        typeof obj.icon        === "string" ? obj.icon        : "📂",
    color:       typeof obj.color       === "string" ? obj.color       : "#6c63ff",
    description: typeof obj.description === "string" ? obj.description : "",
    mode,
    fields,
    order:       typeof obj.order === "number" ? obj.order : index,
    createdAt:   typeof obj.createdAt === "string" ? obj.createdAt : today(),
  };
}

function normalizeCustomEntry(e: unknown, validSectionIds: Set<string>): CustomEntry | null {
  if (!e || typeof e !== "object") return null;
  const obj = e as Record<string, unknown>;
  if (typeof obj.sectionId !== "string" || !validSectionIds.has(obj.sectionId)) return null;
  return {
    id:        typeof obj.id    === "string" ? obj.id    : uid("ent"),
    sectionId: obj.sectionId,
    title:     typeof obj.title   === "string" ? obj.title   : "Sin título",
    content:   typeof obj.content === "string" ? obj.content : "",
    fields:    (obj.fields && typeof obj.fields === "object" && !Array.isArray(obj.fields))
      ? Object.fromEntries(
          Object.entries(obj.fields as Record<string, unknown>)
            .filter(([, v]) => typeof v === "string")
            .map(([k, v]) => [k, v as string])
        )
      : {},
    tags:      Array.isArray(obj.tags) ? obj.tags.filter((t): t is string => typeof t === "string") : [],
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : today(),
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : today(),
    pinned:    obj.pinned === true,
  };
}

export function normalizeState(raw: unknown): AEWState {
  const fallback = createDefaultState();
  if (!raw || typeof raw !== "object") return fallback;
  const obj = raw as Partial<AEWState>;

  // Core: categories
  const categories: Category[] =
    Array.isArray(obj.categories) && obj.categories.length > 0
      ? obj.categories.map((c, i) => ({
          id:          typeof c.id          === "string" ? c.id          : uid("cat"),
          name:        typeof c.name        === "string" ? c.name        : `Categoría ${i + 1}`,
          icon:        typeof c.icon        === "string" ? c.icon        : "📁",
          description: typeof c.description === "string" ? c.description : "",
          order:       typeof c.order === "number" ? c.order : i,
        }))
      : fallback.categories;

  const categoryIds = new Set(categories.map((c) => c.id));

  const articles: Article[] = Array.isArray(obj.articles)
    ? obj.articles.map((a) => ({
        id:         typeof a.id        === "string" ? a.id        : uid("art"),
        title:      typeof a.title     === "string" ? a.title     : "Sin título",
        content:    typeof a.content   === "string" ? a.content   : "",
        date:       typeof a.date      === "string" ? a.date      : today(),
        updatedAt:  typeof a.updatedAt === "string" ? a.updatedAt : today(),
        tags:       Array.isArray(a.tags) ? a.tags.filter((t): t is string => typeof t === "string") : [],
        categoryId: typeof a.categoryId === "string" && categoryIds.has(a.categoryId)
          ? a.categoryId : categories[0]?.id ?? "",
      }))
    : fallback.articles;

  const bugs: Bug[] = Array.isArray(obj.bugs)
    ? obj.bugs.map((b) => ({
        id:       typeof b.id       === "string" ? b.id       : uid("bug"),
        title:    typeof b.title    === "string" ? b.title    : "Sin título",
        cause:    typeof b.cause    === "string" ? b.cause    : "",
        solution: typeof b.solution === "string" ? b.solution : "",
        project:  typeof b.project  === "string" ? b.project  : "",
        date:     typeof b.date     === "string" ? b.date     : today(),
        status:   b.status === "Pendiente" ? "Pendiente" : "Resuelto",
      }))
    : fallback.bugs;

  const experiments: Experiment[] = Array.isArray(obj.experiments)
    ? obj.experiments.map((e) => ({
        id:         typeof e.id         === "string" ? e.id         : uid("exp"),
        title:      typeof e.title      === "string" ? e.title      : "Sin título",
        date:       typeof e.date       === "string" ? e.date       : today(),
        updatedAt:  typeof e.updatedAt  === "string" ? e.updatedAt  : today(),
        summary:    typeof e.summary    === "string" ? e.summary    : "",
        hypothesis: typeof e.hypothesis === "string" ? e.hypothesis : "",
        procedure:  typeof e.procedure  === "string" ? e.procedure  : "",
        result:     typeof e.result     === "string" ? e.result     : "",
        conclusion: typeof e.conclusion === "string" ? e.conclusion : "",
        tags:       Array.isArray(e.tags) ? e.tags.filter((t): t is string => typeof t === "string") : [],
        status:     e.status === "Completado" ? "Completado" : "Pendiente",
      }))
    : fallback.experiments;

  const snippets: Snippet[] = Array.isArray(obj.snippets)
    ? obj.snippets.map((s) => ({
        id:          typeof s.id          === "string" ? s.id          : uid("code"),
        title:       typeof s.title       === "string" ? s.title       : "Sin título",
        language:    typeof s.language    === "string" ? s.language    : "code",
        description: typeof s.description === "string" ? s.description : "",
        code:        typeof s.code        === "string" ? s.code        : "",
        date:        typeof s.date        === "string" ? s.date        : today(),
        updatedAt:   typeof s.updatedAt   === "string" ? s.updatedAt   : today(),
        tags:        Array.isArray(s.tags) ? s.tags.filter((t): t is string => typeof t === "string") : [],
      }))
    : fallback.snippets;

  // Custom sections
  const customSections: CustomSection[] = Array.isArray(obj.customSections)
    ? obj.customSections
        .map((s, i) => normalizeCustomSection(s, i))
        .filter((s): s is CustomSection => s !== null)
        .sort((a, b) => a.order - b.order)
    : [];

  const validSectionIds = new Set(customSections.map((s) => s.id));

  const customEntries: CustomEntry[] = Array.isArray(obj.customEntries)
    ? obj.customEntries
        .map((e) => normalizeCustomEntry(e, validSectionIds))
        .filter((e): e is CustomEntry => e !== null)
    : [];

  return {
    categories: categories.sort((a, b) => a.order - b.order),
    articles,
    bugs,
    experiments,
    snippets,
    customSections,
    customEntries,
  };
}

// ─── Persistence ──────────────────────────────────────────────────────────────
// Namespaced by user: "guest" when logged out, the Supabase user id when
// logged in. Previously this was a single shared key (STORAGE_KEY) for
// everyone — so signing out left the logged-in user's data sitting in the
// "guest" slot, and signing into a different account on the same browser
// would show the previous account's (or guest's) leftover data until the
// remote pull overwrote it. Each identity now gets its own slot, so there's
// nothing to leak between them.

function keyFor(userId: string | null): string {
  return `${STORAGE_KEY}:${userId ?? "guest"}`;
}

export function loadState(userId: string | null): AEWState {
  if (typeof window === "undefined") return createDefaultState();
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    if (!raw) return createDefaultState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AEWState, userId: string | null): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(userId), JSON.stringify(state));
}
