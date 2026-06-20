import type { NavItem, Category } from "./types";

export const STORAGE_KEY = "aew-v2-state";

export const CORE_NAV: NavItem[] = [
  { icon: "⬡",   label: "Dashboard",    id: "dashboard",   color: "#6c63ff" },
  { icon: "📖",  label: "Wiki",         id: "wiki",        color: "#3ecfcf" },
  { icon: "🐛",  label: "Bug Journal",  id: "bugs",        color: "#ff6b6b" },
  { icon: "🧪",  label: "Experimentos", id: "experiments", color: "#f9ca24" },
  { icon: "{ }", label: "Código",       id: "code",        color: "#9a90ff" },
];

// Keep backward compat — Topbar/Sidebar used NAV before
export const NAV = CORE_NAV;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-linux",       name: "Linux",        icon: "🐧", description: "Arch, Hyprland, scripts y aprendizaje real.",     order: 0 },
  { id: "cat-axiom",       name: "AXIOM",        icon: "⚡", description: "Automatización robótica y evolución del proyecto.", order: 1 },
  { id: "cat-programming", name: "Programación", icon: "💻", description: "C++, Python, Arduino, ESP32 y lógica útil.",      order: 2 },
  { id: "cat-electronics", name: "Electrónica",  icon: "⚙️", description: "Sensores, PWM, I2C, motores y energía.",          order: 3 },
  { id: "cat-robotics",    name: "Robótica",     icon: "🤖", description: "Movimiento, control, servos y sistemas físicos.", order: 4 },
];

// Preset color palette for custom sections
export const SECTION_COLORS = [
  "#6c63ff", "#3ecfcf", "#ff6b6b", "#f9ca24", "#9a90ff",
  "#ff9f43", "#48dbfb", "#ff6b81", "#1dd1a1", "#feca57",
  "#54a0ff", "#c44569", "#00d2d3", "#ff9ff3", "#a29bfe",
];

// Preset templates for common custom section types
export const SECTION_TEMPLATES = [
  {
    label:       "Libros",
    icon:        "📚",
    color:       "#ff9f43",
    mode:        "both" as const,
    description: "Libros leídos, en progreso o pendientes.",
    fields: [
      { id: "autor",     label: "Autor",     type: "text"   as const, placeholder: "Nombre del autor",       showInList: true, required: true,  accentField: false },
      { id: "editorial", label: "Editorial", type: "text"   as const, placeholder: "Editorial",               showInList: false, required: false, accentField: false },
      { id: "estado",    label: "Estado",    type: "status" as const, options: ["Leyendo","Completado","Pendiente","Abandonado"], showInList: true, required: false, accentField: true },
      { id: "rating",    label: "Rating",    type: "rating" as const, showInList: true, required: false, accentField: false },
    ],
  },
  {
    label:       "Proyectos",
    icon:        "🚀",
    color:       "#54a0ff",
    mode:        "both" as const,
    description: "Proyectos personales y profesionales.",
    fields: [
      { id: "estado",    label: "Estado",     type: "status" as const, options: ["Activo","Pausado","Completado","Cancelado"], showInList: true, required: false, accentField: true },
      { id: "tecnologia",label: "Stack",      type: "tags"   as const, placeholder: "React, Node, Python...",   showInList: true, required: false, accentField: false },
      { id: "url",       label: "Repositorio",type: "url"    as const, placeholder: "https://github.com/...",   showInList: false, required: false, accentField: false },
      { id: "deadline",  label: "Deadline",   type: "date"   as const, showInList: true, required: false, accentField: false },
    ],
  },
  {
    label:       "Recursos",
    icon:        "🔗",
    color:       "#1dd1a1",
    mode:        "collection" as const,
    description: "Links, artículos, papers y referencias.",
    fields: [
      { id: "url",      label: "URL",      type: "url"    as const, placeholder: "https://...", showInList: true, required: true, accentField: false },
      { id: "tipo",     label: "Tipo",     type: "status" as const, options: ["Artículo","Paper","Video","Herramienta","Curso","Otro"], showInList: true, required: false, accentField: true },
      { id: "dominio",  label: "Dominio",  type: "text"   as const, placeholder: "Área de conocimiento",        showInList: false, required: false, accentField: false },
    ],
  },
  {
    label:       "Ideas",
    icon:        "💡",
    color:       "#feca57",
    mode:        "notes" as const,
    description: "Ideas, pensamientos y conceptos sin procesar.",
    fields: [],
  },
  {
    label:       "Hardware",
    icon:        "🔧",
    color:       "#9a90ff",
    mode:        "both" as const,
    description: "Componentes, módulos y equipos.",
    fields: [
      { id: "modelo",    label: "Modelo",     type: "text"   as const, placeholder: "Número de modelo", showInList: true, required: true, accentField: false },
      { id: "estado",    label: "Estado",     type: "status" as const, options: ["Disponible","En uso","Dañado","Reemplazado"], showInList: true, required: false, accentField: true },
      { id: "datasheet", label: "Datasheet",  type: "url"    as const, placeholder: "URL del datasheet", showInList: false, required: false, accentField: false },
      { id: "precio",    label: "Precio",     type: "number" as const, placeholder: "MXN",                showInList: false, required: false, accentField: false },
    ],
  },
  {
    label:       "Cursos",
    icon:        "🎓",
    color:       "#c44569",
    mode:        "both" as const,
    description: "Cursos, tutoriales y aprendizaje estructurado.",
    fields: [
      { id: "plataforma", label: "Plataforma", type: "select" as const, options: ["YouTube","Udemy","Coursera","edX","freeCodeCamp","Otro"], showInList: true, required: false, accentField: false },
      { id: "url",        label: "URL",         type: "url"    as const, placeholder: "https://...",      showInList: false, required: false, accentField: false },
      { id: "estado",     label: "Estado",      type: "status" as const, options: ["En progreso","Completado","Pendiente","Pausado"],          showInList: true, required: false, accentField: true },
      { id: "progreso",   label: "Progreso %",  type: "number" as const, placeholder: "0-100",           showInList: true, required: false, accentField: false },
    ],
  },
  {
    label:       "En blanco",
    icon:        "📂",
    color:       "#6c63ff",
    mode:        "both" as const,
    description: "",
    fields: [],
  },
] as const;
