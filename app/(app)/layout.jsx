"use client";
import { useState, useEffect } from "react";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import TelaLogin from "@/components/auth/TelaLogin";
import TelaUnidade from "@/components/auth/TelaUnidade";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faLocationDot } from "@fortawesome/free-solid-svg-icons";

const FILIAL_INFO = {
  florianopolis: {
    cidade: "Florianópolis", sigla: "FLN", estado: "SC",
    color: "#6366F1", dot: "#818CF8",
    bg: "rgba(99,102,241,0.18)", border: "rgba(99,102,241,0.5)",
    glow: "rgba(99,102,241,0.6)",
  },
  brasilia: {
    cidade: "Brasília", sigla: "BSB", estado: "DF",
    color: "#10B981", dot: "#34D399",
    bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.5)",
    glow: "rgba(16,185,129,0.6)",
  },
};

// Posições fixas para evitar hydration mismatch
const STARS = [
  {x:4,y:7,s:1.5,d:0},{x:12,y:22,s:1,d:1.2},{x:22,y:4,s:2,d:0.4},
  {x:33,y:16,s:1,d:0.8},{x:44,y:38,s:1.5,d:1.5},{x:53,y:9,s:1,d:0.2},
  {x:61,y:27,s:2,d:0.9},{x:71,y:14,s:1,d:1.7},{x:79,y:42,s:1.5,d:0.3},
  {x:88,y:7,s:1,d:1.1},{x:93,y:21,s:2,d:0.6},{x:8,y:58,s:1,d:1.4},
  {x:19,y:71,s:1.5,d:0.7},{x:37,y:76,s:1,d:1.9},{x:49,y:63,s:2,d:0.1},
  {x:64,y:79,s:1,d:1.3},{x:77,y:65,s:1.5,d:0.5},{x:91,y:72,s:1,d:1.6},
  {x:2,y:45,s:2,d:0.3},{x:96,y:51,s:1.5,d:1},{x:27,y:88,s:1,d:0.8},
  {x:58,y:91,s:1.5,d:1.2},{x:83,y:85,s:1,d:0.4},{x:16,y:50,s:1,d:1.8},
];

function CityCard({ info, side }) {
  return (
    <div className={side === "origin" ? "city-card-origin" : "city-card-dest"}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, width:140, flexShrink:0 }}
    >
      <div style={{
        width:56, height:56, borderRadius:"50%",
        background: info.bg,
        border: `2px solid ${info.border}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        "--glow-color": info.glow,
        animation: "city-glow-pulse 2.2s ease-in-out infinite",
      }}>
        <FontAwesomeIcon icon={faLocationDot} style={{ color: info.dot, fontSize:22 }} />
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#fff", lineHeight:1.2 }}>{info.cidade}</div>
        <div style={{
          display:"inline-block", marginTop:5,
          fontSize:10, fontWeight:700, letterSpacing:"0.15em",
          color: info.dot,
          background: info.bg,
          border: `1px solid ${info.border}`,
          borderRadius:12, padding:"2px 10px",
        }}>{info.estado} · {info.sigla}</div>
      </div>
    </div>
  );
}

function FilialTransition({ origemId, destinoId, exiting }) {
  const origem = FILIAL_INFO[origemId] || FILIAL_INFO.florianopolis;
  const destino = FILIAL_INFO[destinoId] || FILIAL_INFO.brasilia;

  // Caminho do arco: começa em (10,75), pico em (200,-10), termina em (390,75)
  const arcPath = "M 10,75 Q 200,-10 390,75";

  return (
    <div
      className={exiting ? "filial-overlay-exiting" : "filial-overlay-entering"}
      style={{
        position:"fixed", inset:0, zIndex:9999,
        background:"radial-gradient(ellipse at 50% 35%, #0E1B3D 0%, #070C1C 65%, #04080F 100%)",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        overflow:"hidden",
        fontFamily:"'DM Sans','Segoe UI',sans-serif",
        gap:0,
      }}
    >
      {/* Estrelas */}
      {STARS.map((s,i) => (
        <div key={i} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          width:s.s, height:s.s, borderRadius:"50%", background:"#fff",
          animation:`star-twinkle ${1.4 + (i%3)*0.6}s ease-in-out ${s.d}s infinite alternate`,
        }} />
      ))}

      {/* Cena de voo */}
      <div style={{ display:"flex", alignItems:"center", width:"100%", maxWidth:700, padding:"0 24px", position:"relative" }}>
        <CityCard info={origem} side="origin" />

        {/* Arco de voo + avião SVG */}
        <div style={{ flex:1, position:"relative", margin:"0 8px" }}>
          <svg
            viewBox="0 0 400 90"
            width="100%"
            style={{ display:"block", overflow:"visible" }}
          >
            {/* Trilha pontilhada */}
            <path
              d={arcPath}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
            {/* Brilho suave no arco */}
            <path
              d={arcPath}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            {/* Avião animado ao longo do arco com rotate="auto" */}
            <g>
              <animateMotion
                dur="2.8s"
                begin="0.3s"
                fill="freeze"
                rotate="auto"
                path={arcPath}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.05;0.88;1"
                dur="2.8s"
                begin="0.3s"
                fill="freeze"
              />
              <text
                fontSize="22"
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ filter:"drop-shadow(0 0 6px rgba(255,255,255,0.8))" }}
              >✈</text>
            </g>
          </svg>
        </div>

        <CityCard info={destino} side="dest" />
      </div>

      {/* Texto de status */}
      <div className="flight-status-in" style={{ marginTop:44, textAlign:"center" }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>
          Viajando para {destino.cidade}
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:5, letterSpacing:"0.03em" }}>
          Carregando dados da filial...
        </div>
      </div>

      {/* Dots */}
      <div style={{ marginTop:18, display:"flex", gap:6 }}>
        {[0,0.18,0.36].map((d,i) => (
          <div key={i} style={{
            width:6, height:6, borderRadius:"50%",
            background:"rgba(255,255,255,0.6)",
            animation:`filial-dot-bounce 1.3s ease-in-out ${d}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function LandingAnimation({ unidade, erroDb }) {
  const info = FILIAL_INFO[unidade] || FILIAL_INFO.florianopolis;
  const AIRPORT_NAMES = {
    florianopolis: "Aeroporto Hercílio Luz — FLN",
    brasilia:      "Aeroporto Pres. JK — BSB",
  };
  const descentPath = "M 440,14 Q 380,55 240,134";

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 35%, #0E1B3D 0%, #070C1C 65%, #04080F 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      overflow: "hidden", position: "relative",
    }}>
      {/* Estrelas */}
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: "50%", background: "#fff",
          animation: `star-twinkle ${1.4 + (i % 3) * 0.6}s ease-in-out ${s.d}s infinite alternate`,
        }} />
      ))}

      {/* Badge do aeroporto */}
      <div className="flight-status-in" style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: info.bg, border: `1px solid ${info.border}`,
          borderRadius: 24, padding: "7px 18px",
        }}>
          <FontAwesomeIcon icon={faLocationDot} style={{ color: info.dot, fontSize: 13 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{info.cidade}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: info.dot }}>{info.sigla}</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, letterSpacing: "0.05em" }}>
          {AIRPORT_NAMES[unidade]}
        </div>
      </div>

      {/* Cena de pouso */}
      <div style={{ width: "100%", maxWidth: 520, padding: "0 20px" }}>
        <svg viewBox="0 0 480 190" width="100%" style={{ display: "block", overflow: "visible" }}>

          {/* Glide slope (rampa de descida) */}
          <line x1="440" y1="14" x2="240" y2="134"
            stroke={info.color} strokeWidth="1.5"
            opacity="0.22" strokeDasharray="6 5" />

          {/* Pista */}
          <rect x="70" y="134" width="340" height="28" fill="#111827" rx="2" />

          {/* Bordas da pista */}
          <line x1="70"  y1="134" x2="410" y2="134" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
          <line x1="70"  y1="162" x2="410" y2="162" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />

          {/* Faixas de limiar */}
          {[0,1,2,3,4,5].map(i => (
            <g key={i}>
              <rect x={82 + i * 14} y="136" width="8" height="11" fill="rgba(255,255,255,0.75)" rx="1" />
              <rect x={82 + i * 14} y="151" width="8" height="11" fill="rgba(255,255,255,0.75)" rx="1" />
            </g>
          ))}

          {/* Linha central (dashes) */}
          {[130,160,190,220,250,280,310,340,370].map((x, i) => (
            <rect key={i} x={x} y="144" width="18" height="4" fill="rgba(255,255,255,0.3)" rx="1" />
          ))}

          {/* Luzes de borda (piscam em sequência) */}
          {[80,115,150,185,220,255,290,325,360,395,410].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy="134" r="3.5" fill="#F59E0B">
                <animate attributeName="opacity" values="1;0.25;1" dur="1.3s" begin={`${i * 0.09}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy="162" r="3.5" fill="#F59E0B">
                <animate attributeName="opacity" values="0.25;1;0.25" dur="1.3s" begin={`${i * 0.09}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}

{/* Glow na zona de toque */}
          <ellipse cx="200" cy="148" rx="90" ry="10" fill={info.color} opacity="0.12">
            <animate attributeName="opacity" values="0.07;0.22;0.07" dur="2.5s" repeatCount="indefinite" />
          </ellipse>

          {/* Avião pousando */}
          <g>
            <animateMotion dur="2.8s" begin="0.3s" fill="freeze" rotate="auto" path={descentPath} />
            <animate attributeName="opacity" values="0;1;1;1" keyTimes="0;0.04;0.85;1" dur="2.8s" begin="0.3s" fill="freeze" />
            <text fontSize="22" fill="white" textAnchor="middle" dominantBaseline="middle"
              style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9))" }}>✈</text>
          </g>
        </svg>
      </div>

      {/* Texto de status */}
      <div className="flight-status-in" style={{ marginTop: 12, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Pousando em {info.cidade}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 5, letterSpacing: "0.03em" }}>
          Carregando dados da filial...
        </div>
      </div>

      {/* Dots */}
      <div style={{ marginTop: 16, display: "flex", gap: 6 }}>
        {[0, 0.18, 0.36].map((d, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(255,255,255,0.6)",
            animation: `filial-dot-bounce 1.3s ease-in-out ${d}s infinite`,
          }} />
        ))}
      </div>

      {erroDb && (
        <div style={{ marginTop: 12, color: "#EF4444", fontSize: 13, background: "#1E293B", padding: "10px 18px", borderRadius: 10 }}>
          {erroDb}
        </div>
      )}
    </div>
  );
}

function AppShell({ children }) {
  const { carregando, erroDb, authUser, unidade, t, trocandoFilial, unidadeAlvo, unidadeOrigem } = useApp();
  const [collapsed, setCollapsed]           = useState(false);
  const [showOverlay, setShowOverlay]       = useState(false);
  const [overlayExiting, setOverlayExiting] = useState(false);
  const [currentAlvo, setCurrentAlvo]       = useState(null);
  const [currentOrigem, setCurrentOrigem]   = useState(null);
  const [mounted, setMounted]               = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (trocandoFilial) {
      setCurrentOrigem(unidadeOrigem);
      setCurrentAlvo(unidadeAlvo);
      setOverlayExiting(false);
      setShowOverlay(true);
    } else if (showOverlay) {
      setOverlayExiting(true);
      const timer = setTimeout(() => {
        setShowOverlay(false);
        setOverlayExiting(false);
      }, 480);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trocandoFilial]);

  if (!mounted || (carregando && !trocandoFilial)) {
    if (mounted && unidade) return <LandingAnimation unidade={unidade} erroDb={erroDb} />;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A", flexDirection: "column", gap: 16, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ fontSize: 36, color: "#6366F1" }}>
          <FontAwesomeIcon icon={faBoxOpen} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Estoque</div>
        <div style={{ fontSize: 13, color: "#64748B" }}>Conectando ao banco de dados...</div>
        {erroDb && <div style={{ marginTop: 8, color: "#EF4444", fontSize: 13, background: "#1E293B", padding: "10px 18px", borderRadius: 10 }}>{erroDb}</div>}
      </div>
    );
  }

  if (!authUser) return <TelaLogin erroDb={erroDb} />;
  if (!unidade) return <TelaUnidade />;

  return (
    <>
      {showOverlay && <FilialTransition origemId={currentOrigem} destinoId={currentAlvo} exiting={overlayExiting} />}
      <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", height: "100vh", background: t.bg, color: t.text, overflow: "hidden" }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {children}
        </div>
      </div>
    </>
  );
}

export default function AppLayout({ children }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
