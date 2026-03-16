"use client";
import { useState } from "react";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import TelaLogin from "@/components/auth/TelaLogin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";

function AppShell({ children }) {
  const { carregando, erroDb, sessao, t } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A", flexDirection: "column", gap: 16, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ fontSize: 36, color: "#6366F1" }}>
          <FontAwesomeIcon icon={faBoxOpen} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>TI Inventário</div>
        <div style={{ fontSize: 13, color: "#64748B" }}>Conectando ao banco de dados...</div>
        {erroDb && <div style={{ marginTop: 8, color: "#EF4444", fontSize: 13, background: "#1E293B", padding: "10px 18px", borderRadius: 10 }}>{erroDb}</div>}
      </div>
    );
  }

  if (!sessao) return <TelaLogin />;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", height: "100vh", background: t.bg, color: t.text, overflow: "hidden" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
