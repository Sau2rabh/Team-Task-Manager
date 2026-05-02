import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import GlobalLoader from "@/components/GlobalLoader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Team Task Manager | Smart Team Task Manager",
  description: "Next-generation project management with AI-powered task suggestions and team collaboration.",
  keywords: ["task manager", "project management", "AI", "team collaboration", "SaaS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <GlobalLoader>
              {children}
            </GlobalLoader>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
