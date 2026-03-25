import {
  faDesktop, faKeyboard, faComputerMouse, faLaptop, faPlug,
  faHeadphones, faNetworkWired, faBriefcase,
  faBolt, faCrown, faUser, faBook, faMobileScreen, faVideo, faBatteryFull,
} from "@fortawesome/free-solid-svg-icons";

export const CATEGORIAS_ITENS = [
  "Monitor", "Teclado", "Mouse", "Notebook", "HUB",
  "Suporte de Tela", "Capa Notebook", "Fone/Headset",
  "Computador", "Rede", "Kindle",
  "Carregador", "Celular", "Webcam",
];

export const DEPARTAMENTOS = [
  "Todos", "Engenharia", "Marketing", "Financeiro",
  "RH", "Operações", "TI", "Diretoria",
];

export const STATUS_LIST = ["Em Uso", "Disponível", "Manutenção", "Desativado"];
export const STATUS_FILTROS = ["Todos", ...STATUS_LIST];
export const CAT_FILTROS = ["Todas", ...CATEGORIAS_ITENS];

export const STATUSES = {
  "Em Uso":      { color: "#3B82F6", bg: "#EFF6FF", bgDk: "#1e3a5f", dot: "#3B82F6" },
  "Disponível":  { color: "#10B981", bg: "#ECFDF5", bgDk: "#14432a", dot: "#10B981" },
  "Manutenção":  { color: "#F59E0B", bg: "#FFFBEB", bgDk: "#422006", dot: "#F59E0B" },
  "Desativado":  { color: "#6B7280", bg: "#F9FAFB", bgDk: "#1f2937", dot: "#9CA3AF" },
};

export const CAT_ICONS = {
  Monitor:           faDesktop,
  Teclado:           faKeyboard,
  Mouse:             faComputerMouse,
  Notebook:          faLaptop,
  Notebooks:         faLaptop,
  HUB:               faPlug,
  "Suporte de Tela": faDesktop,
  "Capa Notebook":   faBriefcase,
  "Fone/Headset":    faHeadphones,
  Fone:              faHeadphones,
  Computador:        faDesktop,
  Rede:              faNetworkWired,
  Kindle:            faBook,
  Carregador:        faBatteryFull,
  Fontes:            faBatteryFull,
  Celular:           faMobileScreen,
  Celulares:         faMobileScreen,
  Webcam:            faVideo,
};

export const PERFIS = {
  super_admin: { label: "Super Admin", bg: "#1e1b4b", cor: "#c4b5fd", icon: faBolt },
  admin:       { label: "Admin",       bg: "#312e81", cor: "#a5b4fc", icon: faCrown },
  operador:    { label: "Operador",    bg: "#052e16", cor: "#10B981", icon: faUser },
  viewer:      { label: "Viewer",      bg: "#1f2937", cor: "#64748B", icon: faUser },
};

export const AVATAR_ICON_MAP = { bolt: faBolt, crown: faCrown, user: faUser };

export const hoje = () => new Date().toISOString().slice(0, 10);
