import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowEasy AI CSV Importer — Smart CRM Lead Extraction",
  description:
    "Upload any CSV file and let AI intelligently map and extract CRM lead fields into GrowEasy format. Supports Facebook, Google Ads, Excel, and any custom CSV layout.",
  keywords: "CRM, CSV importer, AI, lead extraction, GrowEasy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://js.puter.com/v2/"></script>
      </head>
      <body className="bg-[#FDFBF7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 antialiased font-sans transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                      console.log('Unregistered rogue service worker from another app.');
                    }
                  });
                }
              `,
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
