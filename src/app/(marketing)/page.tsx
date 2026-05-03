import { Hero } from "@/components/sections/home/Hero";
import { OurSolutions } from "@/components/sections/home/OurSolutions";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <OurSolutions />
    </main>
  );
}
