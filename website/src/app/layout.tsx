import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "NFCSOC — SOC Analyst Training Platform",
    template: "%s | NFCSOC Training",
  },
  description:
    "Real-world SOC analyst training. Master incident response, threat hunting, and security analysis through hands-on labs and CTF challenges.",
  keywords: ["SOC", "cybersecurity", "training", "Splunk", "SIEM", "incident response", "CTF"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
