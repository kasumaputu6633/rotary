import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import HomeBannerSlider from "./_components/HomeBannerSlider";
import HomeProductShowcase from "./_components/HomeProductShowcase";
import HomeWasteHighlight from "./_components/HomeWasteHighlight";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <HomeBannerSlider />
        <HomeWasteHighlight />
        <HomeProductShowcase />
      </main>
      <Footer />
    </>
  );
}
