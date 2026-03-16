import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TI Inventário",
  description: "Sistema de Gestão de Equipamentos de TI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
