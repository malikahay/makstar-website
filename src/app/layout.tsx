import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { TransitionProvider } from "@/components/TransitionProvider";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700", "900"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Makstar — макароны, которые хочется варить, жарить и запекать",
    template: "%s — Makstar",
  },
  description:
    "Makstar — макароны из твёрдых сортов пшеницы. Спагетти, перья, спирали, рожки, лапша и ещё 5 форм. Рецепты, доставка и оплата онлайн.",
};

export const viewport: Viewport = {
  themeColor: "#1638ff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-screen">
        <SmoothScroll />
        <CartProvider>
          <TransitionProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <Cursor />
          </TransitionProvider>
        </CartProvider>
      </body>
    </html>
  );
}
