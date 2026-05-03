import { Hero } from "@/components/sections/home/Hero";
import { OurSolutions } from "@/components/sections/home/OurSolutions";
import { VideoSection } from "@/components/sections/home/VideoSection";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <OurSolutions />
      <VideoSection />
    </main>
  );
}
