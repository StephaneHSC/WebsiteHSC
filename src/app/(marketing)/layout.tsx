import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SplashScreen } from "@/components/layout/SplashScreen";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="overflow-hidden">
      {" "}
      {/* this is key — clips the offscreen page without breaking scroll */}
      <Header />
      <SplashScreen>
        {children}
        <Footer />
      </SplashScreen>
    </div>
  );
}
