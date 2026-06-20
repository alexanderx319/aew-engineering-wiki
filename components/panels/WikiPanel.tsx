"use client";

import { useState, useMemo, useEffect } from "react";
import { C, F } from "../../lib/tokens";
import { uid, includesQuery } from "../../lib/utils";
import { today } from "../../lib/utils";
import { Tag } from "../ui/Tag";
import { Btn } from "../ui/Btn";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { ArticleEditor, CategoryModal } from "../editors";
import type { AEWState, Article, Category, EditorMode } from "../../lib/types";

interface WikiPanelProps {
  state:    AEWState;
  setState: React.Dispatch<React.SetStateAction<AEWState>>;
  query:    string;
}

export function WikiPanel({ state, setState, query }: WikiPanelProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(state.categories[0]?.id ?? "");
  const [selectedArticleId,  setSelectedArticleId]  = useState<string | null>(
    state.articles.find((a) => a.categoryId === state.categories[0]?.id)?.id ?? null
  );
  const [editorMode,    setEditorMode]    = useState<EditorMode>("view");
  const [categoryModal, setCategoryModal] = useState<{ mode: "create" | "edit"; category?: Category } | null>(null);
  const [showCategories, setShowCategories] = useState(true);

  const categoryMap = useMemo(() => new Map(state.categories.map((c) => [c.id, c] as const)), [state.categories]);

  const currentCategory = useMemo(
    () => state.categories.find((c) => c.id === selectedCategoryId) ?? state.categories[0],
    [state.categories, selectedCategoryId]
  );

  const selectedArticle = state.articles.find((a) => a.id === selectedArticleId);

  useEffect(() => {
    if (!state.categories.some((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(state.categories[0]?.id ?? "");
    }
  }, [state.categories, selectedCategoryId]);

  // Auto-select first article only when category changes, not on every state update
  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    const first = state.articles.find((a) => a.categoryId === catId);
    setSelectedArticleId(first?.id ?? null);
    setEditorMode("view");
  };

  const q = query.trim().toLowerCase();

  const selectedCategoryArticles = state.articles.filter((a) => {
    if (a.categoryId !== selectedCategoryId) return false;
    if (!q) return true;
    return includesQuery([a.title, a.content, a.tags.join(" "), categoryMap.get(a.categoryId)?.name ?? ""].join(" "), q);
  });

  // ─── Handlers ──────────────────────────────────────────────────────────

  const saveCategory = (payload: { name: string; icon: string; description: string }) => {
    const name = payload.name.trim();
    if (!name) return;
    if (categoryModal?.mode === "create") {
      const newId = uid("cat");
      setState((prev) => ({
        ...prev,
        categories: [...prev.categories, { id: newId, name, icon: payload.icon.trim() || "📁", description: payload.description.trim(), order: prev.categories.length }]
          .sort((a, b) => a.order - b.order),
      }));
      setSelectedCategoryId(newId);
      setSelectedArticleId(null);
      setEditorMode("view");
      setCategoryModal(null);
      return;
    }
    const targetId = categoryModal?.category?.id;
    if (!targetId) return;
    setState((prev) => ({
      ...prev,
      categories: prev.categories
        .map((c) => c.id === targetId ? { ...c, name, icon: payload.icon.trim() || "📁", description: payload.description.trim() } : c)
        .sort((a, b) => a.order - b.order),
    }));
    setCategoryModal(null);
  };

  const deleteCategory = (categoryId: string) => {
    const category = state.categories.find((c) => c.id === categoryId);
    if (!category || state.categories.length === 1) return;
    const fallback = state.categories.find((c) => c.id !== categoryId);
    if (!fallback) return;
    const hasArticles = state.articles.some((a) => a.categoryId === categoryId);
    const message = hasArticles
      ? `Los artículos de "${category.name}" se moverán a "${fallback.name}". ¿Continuar?`
      : `¿Eliminar la categoría "${category.name}"?`;
    if (!confirm(message)) return;
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId).map((c, i) => ({ ...c, order: i })),
      articles:   prev.articles.map((a) => a.categoryId === categoryId ? { ...a, categoryId: fallback.id } : a),
    }));
    handleSelectCategory(fallback.id);
  };

  const saveArticle = (article: Article) => {
    setState((prev) => {
      const exists = prev.articles.some((a) => a.id === article.id);
      const next   = exists
        ? prev.articles.map((a) => (a.id === article.id ? article : a))
        : [article, ...prev.articles];
      return { ...prev, articles: next };
    });
    setSelectedCategoryId(article.categoryId);
    setSelectedArticleId(article.id);
    setEditorMode("view");
  };

  const deleteArticle = (article: Article) => {
    if (!confirm(`¿Eliminar "${article.title}"?`)) return;
    setState((prev) => ({ ...prev, articles: prev.articles.filter((a) => a.id !== article.id) }));
    const remaining = state.articles.filter((a) => a.categoryId === selectedCategoryId && a.id !== article.id);
    setSelectedArticleId(remaining[0]?.id ?? null);
    setEditorMode("view");
  };

  const editingArticle = editorMode === "edit" ? state.articles.find((a) => a.id === selectedArticleId) : undefined;

  // ─── Layout: 3 columns — categories | article list | article content ───
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 220px 1fr", gap: 0, minHeight: "70vh", border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>

      {/* Column 1 — Category list */}
      <div style={{ background: C.surfaceLow, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ color: C.textMuted, fontSize: 9, fontFamily: F.mono, letterSpacing: 2, marginBottom: 10 }}>CATEGORÍAS</div>
          <button
            onClick={() => setCategoryModal({ mode: "create" })}
            style={{ width: "100%", background: C.primary + "18", border: `1px solid ${C.primary}33`, color: C.primary, borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontSize: 11, fontFamily: F.mono }}
          >
            + Nueva categoría
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {state.categories.map((cat) => {
            const count     = state.articles.filter((a) => a.categoryId === cat.id).length;
            const isActive  = selectedCategoryId === cat.id;
            return (
              <div key={cat.id}>
                <button
                  onClick={() => handleSelectCategory(cat.id)}
                  style={{
                    width:        "100%",
                    background:   isActive ? C.primary + "22" : "transparent",
                    border:       isActive ? `1px solid ${C.primary}44` : "1px solid transparent",
                    borderRadius: 8,
                    color:        isActive ? C.textWhite : C.textDim,
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "space-between",
                    gap:          8,
                    padding:      "8px 10px",
                    cursor:       "pointer",
                    fontSize:     12,
                    fontFamily:   F.mono,
                    textAlign:    "left",
                    marginBottom: 2,
                    transition:   "all 0.12s",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 13 }}>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </span>
                  <span style={{ background: C.surfaceHigh, borderRadius: 10, padding: "1px 7px", fontSize: 10, color: C.textFaint }}>
                    {count}
                  </span>
                </button>
                {isActive && (
                  <div style={{ display: "flex", gap: 4, paddingLeft: 10, paddingBottom: 6 }}>
                    <button onClick={() => setCategoryModal({ mode: "edit", category: cat })}
                      style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontSize: 10, fontFamily: F.mono }}>
                      Editar
                    </button>
                    <button onClick={() => deleteCategory(cat.id)}
                      style={{ background: "transparent", border: `1px solid ${C.red}44`, color: C.red, borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontSize: 10, fontFamily: F.mono }}>
                      Borrar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: "12px 8px", borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={() => { setEditorMode("new"); setSelectedArticleId(null); }}
            style={{ width: "100%", background: C.teal + "15", border: `1px solid ${C.teal}33`, color: C.teal, borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontSize: 11, fontFamily: F.mono }}
          >
            + Nuevo artículo
          </button>
        </div>
      </div>

      {/* Column 2 — Article list for selected category */}
      <div style={{ background: "#0e0e12", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "16px 14px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ color: C.textMuted, fontSize: 9, fontFamily: F.mono, letterSpacing: 2, marginBottom: 2 }}>
            {currentCategory?.icon} {currentCategory?.name?.toUpperCase() ?? "WIKI"}
          </div>
          <div style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono }}>
            {selectedCategoryArticles.length} artículo{selectedCategoryArticles.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {selectedCategoryArticles.length === 0 ? (
            <div style={{ color: C.textFaint, fontSize: 11, fontFamily: F.mono, padding: "20px 8px", textAlign: "center", lineHeight: 1.7 }}>
              {q ? "Sin coincidencias." : "Esta categoría\nestá vacía."}
            </div>
          ) : (
            selectedCategoryArticles.map((a) => {
              const isActive = selectedArticleId === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => { setSelectedArticleId(a.id); setEditorMode("view"); }}
                  style={{
                    width:        "100%",
                    background:   isActive ? C.primary + "20" : "transparent",
                    border:       isActive ? `1px solid ${C.primary}44` : "1px solid transparent",
                    borderRadius: 8,
                    color:        isActive ? C.textWhite : C.textDim,
                    padding:      "9px 10px",
                    marginBottom: 3,
                    cursor:       "pointer",
                    textAlign:    "left",
                    fontFamily:   F.mono,
                    fontSize:     12,
                    transition:   "all 0.12s",
                  }}
                >
                  <div style={{ fontWeight: isActive ? 700 : 400, marginBottom: 3, lineHeight: 1.4 }}>{a.title}</div>
                  {a.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {a.tags.slice(0, 2).map((t) => (
                        <span key={t} style={{ background: C.primary + "18", color: C.primary, borderRadius: 4, padding: "1px 5px", fontSize: 9 }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ color: C.textFaint, fontSize: 9, marginTop: 3 }}>{a.updatedAt}</div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Column 3 — Article content / editor */}
      <div style={{ background: C.surface, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {editorMode !== "view" ? (
          <div style={{ padding: 32, flex: 1 }}>
            <ArticleEditor
              key={`${editorMode}-${editingArticle?.id ?? "new"}-${selectedCategoryId}`}
              initial={editorMode === "edit" ? editingArticle : undefined}
              categories={state.categories}
              defaultCategoryId={selectedCategoryId}
              onSave={saveArticle}
              onCancel={() => setEditorMode("view")}
            />
          </div>
        ) : selectedArticle ? (
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ color: C.textMuted, fontSize: 9, fontFamily: F.mono, letterSpacing: 2 }}>
                {currentCategory?.name?.toUpperCase()} / ARTÍCULO
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn label="✏️ Editar"   onClick={() => setEditorMode("edit")} />
                <Btn label="🗑 Eliminar" color={C.red} onClick={() => deleteArticle(selectedArticle)} />
              </div>
            </div>

            <h2 style={{ color: C.textWhite, fontSize: 24, fontWeight: 800, fontFamily: F.mono, marginBottom: 12, letterSpacing: -0.5 }}>
              {selectedArticle.title}
            </h2>

            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <Tag label={categoryMap.get(selectedArticle.categoryId)?.name ?? "Sin categoría"} color={C.teal} />
              {selectedArticle.tags.map((t) => <Tag key={t} label={t} />)}
            </div>

            <div style={{ color: C.textFaint, fontSize: 10, fontFamily: F.mono, marginBottom: 24 }}>
              Creado: {selectedArticle.date} · Actualizado: {selectedArticle.updatedAt}
            </div>

            <div style={{ borderTop: `1px solid ${C.surfaceHigh}`, paddingTop: 24 }}>
              <MarkdownRenderer content={selectedArticle.content} />
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.4 }}>{currentCategory?.icon ?? "📖"}</div>
            <div style={{ color: C.textDim, fontFamily: F.mono, fontSize: 14, marginBottom: 8 }}>
              {currentCategory?.name ?? "Wiki"}
            </div>
            <div style={{ color: C.textFaint, fontFamily: F.mono, fontSize: 12, marginBottom: 28, lineHeight: 1.7 }}>
              {selectedCategoryArticles.length === 0
                ? "Esta categoría está vacía.\nCrea el primer artículo."
                : "Selecciona un artículo\nde la columna izquierda."}
            </div>
            <button
              onClick={() => setEditorMode("new")}
              style={{ background: C.primary, border: "none", color: "#fff", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontFamily: F.mono, fontWeight: 700 }}
            >
              + Crear artículo
            </button>
          </div>
        )}
      </div>

      {categoryModal && (
        <CategoryModal
          key={`${categoryModal.mode}-${categoryModal.category?.id ?? "new"}`}
          mode={categoryModal.mode}
          initial={categoryModal.category}
          onClose={() => setCategoryModal(null)}
          onSave={saveCategory}
        />
      )}
    </div>
  );
}
