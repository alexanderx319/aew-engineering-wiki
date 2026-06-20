// ─── Core section IDs (hardcoded, always present) ──────────────────────────

export type CoreSectionId = "dashboard" | "wiki" | "bugs" | "experiments" | "code";
export type SectionId     = CoreSectionId | string; // custom sections use their id

export type EditorMode        = "view" | "new" | "edit";
export type BugStatus         = "Resuelto" | "Pendiente";
export type ExperimentStatus  = "Pendiente" | "Completado";

// ─── Wiki types ─────────────────────────────────────────────────────────────

export interface Category {
  id:          string;
  name:        string;
  icon:        string;
  description: string;
  order:       number;
}

export interface Article {
  id:         string;
  title:      string;
  tags:       string[];
  date:       string;
  updatedAt:  string;
  content:    string;
  categoryId: string;
}

// ─── Bug types ───────────────────────────────────────────────────────────────

export interface Bug {
  id:       string;
  title:    string;
  cause:    string;
  solution: string;
  project:  string;
  date:     string;
  status:   BugStatus;
}

// ─── Experiment types ────────────────────────────────────────────────────────

export interface Experiment {
  id:         string;
  title:      string;
  tags:       string[];
  date:       string;
  updatedAt:  string;
  status:     ExperimentStatus;
  summary:    string;
  hypothesis: string;
  procedure:  string;
  result:     string;
  conclusion: string;
}

// ─── Snippet types ───────────────────────────────────────────────────────────

export interface Snippet {
  id:          string;
  title:       string;
  language:    string;
  tags:        string[];
  date:        string;
  updatedAt:   string;
  description: string;
  code:        string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM SECTION SYSTEM — the extensible layer
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Field types supported in custom section schemas.
 * Each maps to a specific input widget in the generic entry form.
 */
export type FieldType =
  | "text"       // single-line input
  | "textarea"   // multi-line text
  | "number"     // numeric input
  | "select"     // dropdown with predefined options
  | "tags"       // comma-separated tags
  | "url"        // URL input with link preview
  | "date"       // date picker
  | "rating"     // 1-5 star rating
  | "status"     // custom status badge (uses options[])
  | "code";      // monospace code block

/**
 * Defines one field in a custom section's schema.
 */
export interface FieldSchema {
  id:           string;      // unique within the section, e.g. "author"
  label:        string;      // display label, e.g. "Autor"
  type:         FieldType;
  placeholder?: string;
  options?:     string[];    // for select / status types
  required?:    boolean;
  showInList?:  boolean;     // whether to show in the entry list view
  accentField?: boolean;     // highlight this field visually (e.g. rating, status)
}

/**
 * Content mode of a custom section.
 * - "collection" : structured fields only (like Bugs)
 * - "notes"      : free markdown content only (like Wiki articles)
 * - "both"       : structured fields + free content editor
 */
export type SectionContentMode = "collection" | "notes" | "both";

/**
 * A custom section definition — the schema that describes the section.
 */
export interface CustomSection {
  id:          string;                // e.g. "sec-libros-abc123"
  name:        string;                // display name
  icon:        string;                // emoji or short string
  color:       string;                // hex color
  description: string;
  mode:        SectionContentMode;
  fields:      FieldSchema[];         // schema — empty means notes only
  order:       number;                // position in sidebar after core sections
  createdAt:   string;
}

/**
 * A single entry in a custom section.
 */
export interface CustomEntry {
  id:        string;
  sectionId: string;
  title:     string;
  content:   string;                  // markdown content (used when mode is "notes" or "both")
  fields:    Record<string, string>;  // fieldId → value
  tags:      string[];
  createdAt: string;
  updatedAt: string;
  pinned:    boolean;
}

// ─── Application state ───────────────────────────────────────────────────────

export interface AEWState {
  // Core sections (hardcoded, always present)
  categories:      Category[];
  articles:        Article[];
  bugs:            Bug[];
  experiments:     Experiment[];
  snippets:        Snippet[];

  // Custom section system (extensible)
  customSections:  CustomSection[];
  customEntries:   CustomEntry[];
}

// ─── Search ──────────────────────────────────────────────────────────────────

export type SearchHitKind =
  | "category" | "article" | "bug" | "experiment" | "snippet"
  | "customEntry";

export type SearchHit = {
  section:  SectionId;
  kind:     SearchHitKind;
  id:       string;
  title:    string;
  subtitle: string;
  excerpt:  string;
};

// ─── Nav ─────────────────────────────────────────────────────────────────────

export interface NavItem {
  icon:     string;
  label:    string;
  id:       SectionId;
  color:    string;
  custom?:  boolean;
}
