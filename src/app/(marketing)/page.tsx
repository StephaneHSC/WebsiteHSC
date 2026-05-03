import { Hero } from "@/components/sections/home/Hero";
import { OurSolutions } from "@/components/sections/home/OurSolutions";
import { VideoSection } from "@/components/sections/home/VideoSection";
import { SmartTracking } from "@/components/sections/home/SmartTracking";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <OurSolutions />
      <VideoSection />
      <SmartTracking />
    </main>
  );
}
