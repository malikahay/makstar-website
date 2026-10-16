import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductsProvider } from "@/components/ProductsProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { TransitionProvider } from "@/components/TransitionProvider";
import { getProducts } from "@/lib/catalog";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDict, getLang } from "@/i18n/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: { default: t.meta.title, template: "%s — Makstar" },
    description: t.meta.description,
  };
}

export const viewport: Viewport = {
  themeColor: "#1638ff",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const products = await getProducts(lang);
  return (
    <html lang={lang} className={`${unbounded.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-screen">
        <SmoothScroll />
        <LocaleProvider lang={lang}>
          <ProductsProvider products={products}>
            <AuthProvider>
              <CartProvider>
                <TransitionProvider>
                  <Header />
                  <main>{children}</main>
                  <Footer />
                  <CartDrawer />
                  <Cursor />
                </TransitionProvider>
              </CartProvider>
            </AuthProvider>
          </ProductsProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
