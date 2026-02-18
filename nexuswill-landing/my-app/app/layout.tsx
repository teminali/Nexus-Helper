import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Nexus Will | Welcome to the Grand Line",
  description: "Software development is no longer a job. It is an adventure. The AI sea is wild. Only those with Will survive.",
  keywords: ["AI", "software development", "Grand Line", "Nexus Will", "coding", "developer tools"],
  authors: [{ name: "Nexus Will" }],
  icons: {
    icon: [
      { url: "/favicon-32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "128x128", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Nexus Will | Welcome to the Grand Line",
    description: "The era of AI is here. Most devs will drown. The ones with Will... will rule the New World.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent flash of wrong theme
                const theme = localStorage.getItem('theme') || 'system';
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = theme === 'dark' || (theme === 'system' && systemDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased transition-colors duration-300">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
