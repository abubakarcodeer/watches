import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "../../data/images";

export default function PromoBanners() {
  return (
    <section className="container grid gap-5 pt-10 md:grid-cols-2 md:pt-12">
      <div className="relative isolate flex min-h-[230px] flex-col justify-center overflow-hidden rounded-2xl bg-night p-7 text-white md:min-h-[250px] md:p-9">
        <img src={IMAGES.promoLuxury} alt="" loading="lazy" className="absolute inset-y-0 right-0 -z-20 h-full w-[68%] object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night from-[34%] via-night/70 via-[56%] to-transparent" />
        <p className="text-sm text-white/85">Up to 40% Off</p>
        <h2 className="mt-1 text-[26px] font-semibold leading-tight md:text-[30px]">Luxury Watches</h2>
        <Link href="/shop/collection/luxury" className="btn-gold mt-5 self-start">
          Shop Now <ArrowRight size={15} />
        </Link>
        <p className="mt-6 flex items-center gap-3 text-[11px] text-white/70">
          Top Brands <span className="h-3 w-px bg-white/30" /> Limited Time
        </p>
      </div>

      <div className="relative isolate flex min-h-[230px] flex-col justify-center overflow-hidden rounded-2xl bg-cream p-7 md:min-h-[250px] md:p-9">
        <img src={IMAGES.promoWomens} alt="" loading="lazy" className="absolute inset-y-0 right-0 -z-20 h-full w-[62%] object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cream from-[40%] via-cream/60 via-[60%] to-transparent" />
        <p className="text-lg font-medium leading-none">Elegant</p>
        <h2 className="mt-1.5 text-[26px] font-semibold leading-tight md:text-[30px]">Women's Watches</h2>
        <p className="mt-2 text-[13px] text-muted">Style in Every Second</p>
        <Link href="/shop/category/womens" className="btn-gold mt-5 self-start">
          Shop Now <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
