import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import HomeBannerSlider from "./_components/HomeBannerSlider";
import HomeProductShowcase from "./_components/HomeProductShowcase";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <HomeBannerSlider />
        <HomeProductShowcase />
      </main>
      <Footer />
    </>
  );
}
