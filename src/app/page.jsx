import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import PromoBanners from "../components/home/PromoBanners";
import { BestSellers, LatestArrivals } from "../components/home/ProductRows";
import TopBrands from "../components/home/TopBrands";
import { CollectionBanner, DealBanner } from "../components/home/Banners";
import FeaturedCollections from "../components/home/FeaturedCollections";
import Testimonials from "../components/home/Testimonials";
import Newsletter from "../components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <PromoBanners />
      <BestSellers />
      <TopBrands />
      <CollectionBanner />
      <FeaturedCollections />
      <DealBanner />
      <LatestArrivals />
      <Testimonials />
      <Newsletter />
    </>
  );
}
