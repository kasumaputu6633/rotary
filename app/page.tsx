import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import HomeBannerSlider from "./_components/HomeBannerSlider";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white min-h-[60vh]">
        <HomeBannerSlider />
      </main>
      <Footer />
    </>
  );
}
