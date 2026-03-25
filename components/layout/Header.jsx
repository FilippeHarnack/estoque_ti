"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faSun, faMoon,
  faLocationDot, faChevronDown, faCheck, faArrowRightArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const UNIDADES = [
  {
    id: "florianopolis", cidade: "Florianópolis", sigla: "FLN", estado: "SC",
    color: "#6366F1", colorDk: "#818CF8",
    bg: "#EEF2FF", bgDk: "rgba(99,102,241,0.18)",
    border: "#C7D2FE", borderDk: "rgba(99,102,241,0.45)",
  },
  {
    id: "brasilia", cidade: "Brasília", sigla: "BSB", estado: "DF",
    color: "#10B981", colorDk: "#34D399",
    bg: "#ECFDF5", bgDk: "rgba(16,185,129,0.18)",
    border: "#A7F3D0", borderDk: "rgba(16,185,129,0.45)",
  },
];

export default function Header({ title, search, onSearch, actions }) {
  const { t, dark, setDark, unidade, setUnidade } = useApp();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef(null);

  const unidadeAtual = UNIDADES.find((u) => u.id === unidade) || UNIDADES[0];

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!dropdownAberto) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownAberto]);

  const trocarUnidade = (id) => {
    if (id !== unidade) setUnidade(id);
    setDropdownAberto(false);
  };

  return (
    <header style={{
      background: t.surface,
      borderBottom: `1px solid ${t.border}`,
      padding: "0 24px",
      height: 58,
      display: "flex",
      alignItems: "center",
      gap: 14,
      flexShrink: 0,
    }}>
      <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text, flex: 1 }}>{title}</h1>

      {onSearch !== undefined && (
        <div style={{ position: "relative", width: 240 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.textFaint, fontSize: 13 }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            value={search || ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar equipamentos…"
            style={{ width: "100%", padding: "7px 12px 7px 30px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, fontSize: 13, color: t.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
      )}

      {actions}

      {/* Seletor de filial */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownAberto((p) => !p)}
          title="Trocar filial"
          style={{
            height: 36,
            padding: "0 12px",
            borderRadius: 20,
            border: `1.5px solid ${dark ? unidadeAtual.borderDk : unidadeAtual.border}`,
            background: dark ? unidadeAtual.bgDk : unidadeAtual.bg,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexShrink: 0,
            color: dark ? unidadeAtual.colorDk : unidadeAtual.color,
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          {/* Dot colorido */}
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: dark ? unidadeAtual.colorDk : unidadeAtual.color,
            flexShrink: 0,
            boxShadow: `0 0 0 2px ${dark ? unidadeAtual.bgDk : unidadeAtual.bg}`,
          }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{unidadeAtual.cidade}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, opacity: 0.65,
            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
            padding: "1px 5px", borderRadius: 6,
          }}>{unidadeAtual.sigla}</span>
          <FontAwesomeIcon
            icon={faChevronDown}
            style={{ fontSize: 9, marginLeft: 1, transition: "transform 0.2s", transform: dropdownAberto ? "rotate(180deg)" : "none" }}
          />
        </button>

        {dropdownAberto && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,0,0,0.14)",
            minWidth: 230,
            overflow: "hidden",
            zIndex: 100,
          }}>
            {/* Header do dropdown */}
            <div style={{
              padding: "10px 14px 8px",
              borderBottom: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <FontAwesomeIcon icon={faArrowRightArrowLeft} style={{ fontSize: 10, color: t.textFaint }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Trocar filial
              </span>
            </div>

            {/* Opções */}
            <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 3 }}>
              {UNIDADES.map((u) => {
                const ativa = u.id === unidade;
                const cor = dark ? u.colorDk : u.color;
                return (
                  <button
                    key={u.id}
                    onClick={() => trocarUnidade(u.id)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      background: ativa ? (dark ? u.bgDk : u.bg) : "transparent",
                      border: `1.5px solid ${ativa ? (dark ? u.borderDk : u.border) : "transparent"}`,
                      borderRadius: 10,
                      cursor: ativa ? "default" : "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={(e) => { if (!ativa) e.currentTarget.style.background = t.bg; }}
                    onMouseLeave={(e) => { if (!ativa) e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* Ícone colorido */}
                    <div style={{
                      width: 34, height: 34,
                      borderRadius: 10,
                      background: ativa ? cor : (dark ? "rgba(255,255,255,0.06)" : t.border),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.12s",
                    }}>
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        style={{ fontSize: 14, color: ativa ? "#fff" : t.textFaint }}
                      />
                    </div>

                    {/* Textos */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: ativa ? cor : t.text, lineHeight: 1.3 }}>
                        {u.cidade}
                      </div>
                      <div style={{ fontSize: 11, color: t.textFaint, marginTop: 1 }}>
                        {u.estado} • <span style={{ fontWeight: 600 }}>{u.sigla}</span>
                      </div>
                    </div>

                    {/* Badge ativo */}
                    {ativa ? (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 20, height: 20, borderRadius: "50%",
                        background: cor,
                        flexShrink: 0,
                      }}>
                        <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9, color: "#fff" }} />
                      </div>
                    ) : (
                      <div style={{
                        fontSize: 10, fontWeight: 600, color: t.textFaint,
                        background: dark ? "rgba(255,255,255,0.06)" : t.border,
                        padding: "2px 7px", borderRadius: 6,
                        flexShrink: 0,
                      }}>
                        Entrar
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dark mode */}
      <button
        onClick={() => setDark((d) => !d)}
        style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.bg, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: t.textMuted }}
      >
        <FontAwesomeIcon icon={dark ? faSun : faMoon} />
      </button>
    </header>
  );
}
