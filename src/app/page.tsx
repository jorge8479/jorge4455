import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import TopPlayers from "@/components/home/TopPlayers";
import LatestNews from "@/components/home/LatestNews";
import DiscordWidget from "@/components/home/DiscordWidget";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <TopPlayers />
      <LatestNews />
      <DiscordWidget />
      <Footer />
    </main>
  );
}
