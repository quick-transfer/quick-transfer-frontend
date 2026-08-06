import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quick Transfer",
  description: "Sistema de gerenciamento de turmas, alunos e vagas",
  icons: {
    icon: '/assets/images/logo/logo-weg.png', // Caminho a partir da pasta public/
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
