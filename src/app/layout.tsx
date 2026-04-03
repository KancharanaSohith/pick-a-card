import type { Metadata } from "next";
import { Inter, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-speakup-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-speakup-display",
  display: "swap",
  weight: ["400", "700"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-speakup-lora",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SpeakUp | Chamber of Eloquence",
  description:
    "Practice speaking with shuffled topic cards—filters, timer, and gentle prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${lora.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
