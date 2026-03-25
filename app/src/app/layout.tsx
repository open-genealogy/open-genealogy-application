import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenGenealogy",
  description: "Arbre généalogique de la famille Demey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Theme accentColor="indigo" grayColor="slate" radius="medium">
          {children}
        </Theme>
      </body>
    </html>
  );
}
