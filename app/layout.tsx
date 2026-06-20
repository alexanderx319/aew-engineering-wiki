import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:        "AEW — Alexander Engineering Wiki",
  description:  "Sistema personal de conocimiento de ingeniería.",
  manifest:     "/manifest.json",
  appleWebApp: {
    capable:           true,
    statusBarStyle:    "black-translucent",
    title:             "AEW",
  },
  icons: {
    icon:   [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple:  [{ url: "/icon-192.svg" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor:          "#6c63ff",
  width:               "device-width",
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
  viewportFit:         "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
