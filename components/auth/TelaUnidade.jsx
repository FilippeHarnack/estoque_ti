"use client";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const UNIDADES = [
  {
    id: "florianopolis",
    nome: "Euro Info",
    cidade: "Florianópolis",
    uf: "SC",
    sigla: "FLN",
    desc: "Unidade Santa Catarina",
    imagem: "/florianopolis.jpeg",
    cor: "#6366F1",
    corGlow: "rgba(99,102,241,0.5)",
  },
  {
    id: "brasilia",
    nome: "Euro Info",
    cidade: "Brasília",
    uf: "DF",
    sigla: "BSB",
    desc: "Unidade Distrito Federal",
    imagem: "/brasilia.jpeg",
    cor: "#10B981",
    corGlow: "rgba(16,185,129,0.5)",
  },
];

export default function TelaUnidade() {
  const { setUnidade, handleLogout, authUser, authNome } = useApp();
  const [hovered, setHovered] = useState(null);

  const limparNome = (raw) => {
    if (!raw) return null;
    if (!raw.includes(" ") && raw.includes(".")) {
      const parte = raw.split(".")[0];
      return parte.charAt(0).toUpperCase() + parte.slice(1);
    }
    return raw;
  };

  const primeiroNome =
    limparNome(authNome) ||
    authUser?.user_metadata?.full_name?.split(" ")[0] ||
    authUser?.user_metadata?.name?.split(" ")[0] ||
    limparNome(authUser?.email?.split("@")[0]) ||
    "você";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#06090F",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      padding: "48px 24px",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Gradiente radial de fundo */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 65%)",
      }} />

      {/* Grade sutil */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* ── Cabeçalho ── */}
      <div style={{ textAlign: "center", marginBottom: 48, position: "relative", zIndex: 1 }}>

        {/* Pílula de marca */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.28)",
          borderRadius: 20, padding: "5px 14px", marginBottom: 22,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#818CF8",
            animation: "city-glow-pulse 2s ease-in-out infinite",
            "--glow-color": "rgba(129,140,248,0.8)",
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#818CF8", letterSpacing: "0.09em", textTransform: "uppercase" }}>
            Euro Info · Gestão de Estoque
          </span>
        </div>

        <h1 style={{
          margin: "0 0 14px",
          fontSize: 38,
          fontWeight: 800,
          color: "#F1F5F9",
          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}>
          Escolha a unidade
        </h1>

        <p style={{ fontSize: 15, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
          Olá,{" "}
          <span style={{ color: "#818CF8", fontWeight: 700 }}>{primeiroNome}</span>
          {" "}— selecione a filial para acessar o estoque.
        </p>
      </div>

      {/* ── Cards ── */}
      <div style={{
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
      }}>
        {UNIDADES.map((u) => {
          const isHov = hovered === u.id;
          return (
            <button
              key={u.id}
              onClick={() => setUnidade(u.id)}
              onMouseEnter={() => setHovered(u.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative",
                width: 310,
                height: 400,
                borderRadius: 22,
                border: `1.5px solid ${isHov ? u.cor + "99" : "rgba(255,255,255,0.07)"}`,
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                background: "#111827",
                transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.2s ease",
                transform: isHov ? "translateY(-10px) scale(1.015)" : "none",
                boxShadow: isHov
                  ? `0 28px 64px rgba(0,0,0,0.55), 0 0 48px ${u.corGlow}25`
                  : "0 4px 24px rgba(0,0,0,0.35)",
              }}
            >
              {/* Foto da cidade */}
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${u.imagem})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                transform: isHov ? "scale(1.08)" : "scale(1)",
              }} />

              {/* Overlay gradiente permanente */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: isHov
                  ? "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.92) 100%)"
                  : "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.88) 100%)",
                transition: "background 0.3s ease",
              }} />

              {/* Badge SIGLA — topo direito */}
              <div style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: `1px solid ${u.cor}55`,
                borderRadius: 10,
                padding: "4px 11px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: u.cor }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.12em" }}>
                  {u.sigla}
                </span>
              </div>

              {/* Conteúdo inferior */}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                padding: "0 22px 24px",
              }}>
                {/* Barra colorida animada */}
                <div style={{
                  height: 3,
                  borderRadius: 3,
                  background: u.cor,
                  width: isHov ? 52 : 30,
                  marginBottom: 14,
                  transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)",
                  boxShadow: isHov ? `0 0 12px ${u.cor}` : "none",
                }} />

                {/* Marca */}
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}>
                  {u.nome}
                </div>

                {/* Cidade */}
                <div style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.1,
                  marginBottom: 5,
                  letterSpacing: "-0.4px",
                }}>
                  {u.cidade}
                </div>

                {/* Descrição */}
                <div style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 18,
                }}>
                  {u.desc}
                </div>

                {/* Botão de ação */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isHov ? u.cor : "rgba(255,255,255,0.09)",
                  borderRadius: 12,
                  padding: "11px 16px",
                  transition: "background 0.25s ease",
                  backdropFilter: "blur(6px)",
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.01em",
                  }}>
                    {isHov ? "Acessar agora" : "Acessar filial"}
                  </span>
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: 8,
                    background: isHov ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform 0.2s ease, background 0.2s ease",
                    transform: isHov ? "translateX(2px)" : "none",
                  }}>
                    <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11, color: "#fff" }} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Botão sair ── */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: 44,
          background: "none",
          border: "1px solid rgba(239,68,68,0.18)",
          color: "rgba(239,68,68,0.6)",
          fontSize: 12,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 18px",
          borderRadius: 20,
          transition: "all 0.18s ease",
          fontFamily: "inherit",
          fontWeight: 600,
          letterSpacing: "0.03em",
          position: "relative",
          zIndex: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          e.currentTarget.style.color = "#EF4444";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.color = "rgba(239,68,68,0.6)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.18)";
        }}
      >
        <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 11 }} />
        Sair do sistema
      </button>
    </div>
  );
}
