import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acessa Vagas",
  description: "Conectando talentos a oportunidades de trabalho mais acessíveis."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}