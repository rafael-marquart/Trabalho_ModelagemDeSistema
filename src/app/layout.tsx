import type { Metadata } from "next";
// Fonts are bundled with the app (no request to a third-party font service).
import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/atkinson-hyperlegible-next/600.css";
import "@fontsource/atkinson-hyperlegible-next/700.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";
import ContrastProvider from "@/components/contrast-provider";
import SkipLink from "@/components/skip-link";

export const metadata: Metadata = {
  title: "Acessa Vagas",
  description: "Conectando talentos a oportunidades de trabalho mais acessíveis."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <SkipLink />
        <ThemeProvider><ContrastProvider>{children}</ContrastProvider></ThemeProvider>
      </body>
    </html>
  );
}