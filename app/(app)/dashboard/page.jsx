"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { StatCard, Table } from "@/components/ui";
import { STATUSES, CAT_ICONS, CATEGORIAS_ITENS } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen, faBriefcase, faCircleCheck, faWrench, faBoxArchive,
  faArrowDown, faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardPage() {
  const { t, dark, sessao, stats, itens, historico } = useApp();
  const router = useRouter();

  return (
    <>
      <Header title="Visão Geral" />
      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div style={{ background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, borderRadius: 16, padding: "20px 24px", color: "#fff" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Olá, {sessao?.nome?.split(" ")[0]}!</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              Perfil: <strong style={{ textTransform: "capitalize" }}>{sessao?.perfil}</strong> · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} · {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard t={t} label="Total de Itens"  value={stats.total}      icon={<FontAwesomeIcon icon={faBoxOpen} />}       accent="#6366F1" sub={`${stats.totalUnid} unidades`}       onClick={() => router.push("/equipamentos")} />
            <StatCard t={t} label="Em Uso"           value={stats.emUso}      icon={<FontAwesomeIcon icon={faBriefcase} />}     accent="#3B82F6" sub={`${stats.total ? Math.round(stats.emUso / stats.total * 100) : 0}% da frota`} onClick={() => router.push("/equipamentos?status=Em+Uso")} />
            <StatCard t={t} label="Disponível"       value={stats.disponivel} icon={<FontAwesomeIcon icon={faCircleCheck} />}   accent="#10B981" sub={`${stats.dispUnid} unidades livres`} onClick={() => router.push("/equipamentos?status=Dispon%C3%ADvel")} />
            <StatCard t={t} label="Manutenção"       value={stats.manutencao} icon={<FontAwesomeIcon icon={faWrench} />}        accent="#F59E0B" sub="Necessita atenção" onClick={() => router.push("/equipamentos?status=Manuten%C3%A7%C3%A3o")} />
            <StatCard t={t} label="Desativado"       value={stats.desativado} icon={<FontAwesomeIcon icon={faBoxArchive} />}    accent="#6B7280" sub="Fim de vida" onClick={() => router.push("/equipamentos?status=Desativado")} />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>

            <div style={{ flex: 2, minWidth: 260, background: t.surface, borderRadius: 16, padding: "18px 22px", border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 13, color: t.textFaint, fontWeight: 600, marginBottom: 14 }}>Distribuição de Status</div>
              <div style={{ display: "flex", height: 10, borderRadius: 10, overflow: "hidden", gap: 2, marginBottom: 14, background: t.bg }}>
                {Object.entries({ "Em Uso": stats.emUso, "Disponível": stats.disponivel, "Manutenção": stats.manutencao, "Desativado": stats.desativado }).map(([s, c]) => (
                  <div key={s} style={{ width: `${stats.total ? (c / stats.total) * 100 : 0}%`, background: STATUSES[s]?.dot, borderRadius: 10, minWidth: c > 0 ? 4 : 0 }} />
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
                {Object.entries({ "Em Uso": stats.emUso, "Disponível": stats.disponivel, "Manutenção": stats.manutencao, "Desativado": stats.desativado }).map(([s, c]) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textMuted }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUSES[s]?.dot }} />{s}: <strong style={{ color: t.text }}>{c}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 200, background: t.surface, borderRadius: 16, padding: "18px 22px", border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 13, color: t.textFaint, fontWeight: 600, marginBottom: 14 }}>Por Categoria</div>
              {CATEGORIAS_ITENS.map((cat) => {
                const c = itens.filter((i) => i.categoria === cat).length;
                if (!c) return null;
                const max = Math.max(...CATEGORIAS_ITENS.map((c2) => itens.filter((i) => i.categoria === c2).length), 1);
                return (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, width: 18, textAlign: "center", color: t.textMuted }}>
                      {CAT_ICONS[cat] && <FontAwesomeIcon icon={CAT_ICONS[cat]} />}
                    </span>
                    <span style={{ fontSize: 12, color: t.textMuted, width: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</span>
                    <div style={{ flex: 1, height: 5, background: t.bg, borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${(c / max) * 100}%`, height: "100%", background: t.accent, borderRadius: 10 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text, width: 16, textAlign: "right" }}>{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Últimas Movimentações</span>
              <button onClick={() => router.push("/historico")} style={{ background: "none", border: "none", color: t.accent, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todas →</button>
            </div>
            <Table t={t} emptyMsg="Sem movimentações registradas."
              cols={[
                { label: "Data",    render: (r) => <span style={{ color: t.textFaint, fontSize: 12 }}>{r.data}</span> },
                { label: "Tipo",    render: (r) => (
                  <span style={{ fontWeight: 700, fontSize: 12, color: r.tipo === "entrada" ? t.success : t.danger, background: r.tipo === "entrada" ? t.successBg : t.dangerBg, padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <FontAwesomeIcon icon={r.tipo === "entrada" ? faArrowDown : faArrowUp} />
                    {r.tipo === "entrada" ? "Entrada" : "Saída"}
                  </span>
                )},
                { label: "Item",    render: (r) => <span style={{ color: t.text, fontWeight: 500 }}>{r.itemNome}</span> },
                { label: "Qtd.",    render: (r) => <span style={{ fontWeight: 700, color: r.tipo === "entrada" ? t.success : t.danger }}>{r.tipo === "entrada" ? "+" : "-"}{r.qty}</span> },
                { label: "Usuário", render: (r) => <span style={{ color: t.textFaint, fontSize: 12 }}>{r.usuario}</span> },
              ]}
              rows={historico.slice(0, 5)}
            />
          </div>
        </div>
      </main>
    </>
  );
}
