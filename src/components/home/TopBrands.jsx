import Link from "next/link";
import { BRANDS, slugify } from "../../lib/config";
import BrandLogo from "../ui/BrandLogo";
import SectionHeader from "./SectionHeader";

export default function TopBrands() {
  return (
    <section id="brands" className="container scroll-mt-28 pt-12 md:pt-14">
      <div className="rounded-2xl bg-sand px-6 py-7 md:px-9 md:py-8">
        <SectionHeader title="Top Brands" subtitle="World's most trusted watch brands, all in one place." href="/brands" linkLabel="View All Brands" />
        <ul className="grid grid-cols-2 items-center gap-x-6 gap-y-7 pt-2 text-ink sm:grid-cols-4 lg:flex lg:justify-between">
          {BRANDS.map((brand) => (
            <li key={brand}>
              <Link href={`/shop/brand/${slugify(brand)}`} aria-label={`${brand} watches`} className="group flex h-16 items-center justify-center">
                <BrandLogo brand={brand} hoverColor />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
