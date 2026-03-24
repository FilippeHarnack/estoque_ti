"use client";
import { useApp } from "@/contexts/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

const UNIDADES = [
  { id: "florianopolis", nome: "Euro Info", cidade: "Florianópolis" },
  { id: "brasilia",      nome: "Euro Info", cidade: "Brasília"      },
];

export default function TelaUnidade() {
  const { setUnidade, handleLogout } = useApp();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0F172A",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        gap: 0,
      }}
    >
      <h1
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: "#fff",
          margin: 0,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Qual é a sua unidade?
      </h1>

      <p style={{ fontSize: 16, color: "#94A3B8", margin: 0, marginBottom: 56, textAlign: "center" }}>
        Selecione a unidade para continuar
      </p>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
        {UNIDADES.map((u) => (
          <button
            key={u.id}
            onClick={() => setUnidade(u.id)}
            style={{
              background: "#fff",
              border: "none",
              borderRadius: 20,
              width: 180,
              height: 180,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
              e.currentTarget.style.boxShadow = "0 12px 36px rgba(99,102,241,0.28)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)";
            }}
          >
            <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 38, color: "#1E293B" }} />
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
        {UNIDADES.map((u) => (
          <div
            key={u.id}
            style={{ width: 180, textAlign: "center" }}
          >
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{u.nome}</div>
            <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 4 }}>{u.cidade}</div>
          </div>
        ))}
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 64,
          background: "none",
          border: "none",
          color: "#475569",
          fontSize: 14,
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: 8,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
      >
        Sair do sistema
      </button>
    </div>
  );
}
