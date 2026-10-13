import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "../../data/images";

export function CollectionBanner() {
  return (
    <section className="container pt-12 md:pt-14">
      <div className="relative isolate grid overflow-hidden rounded-2xl bg-forest text-white md:min-h-[300px] md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-11">
          <p className="eyebrow text-white/70">Our Collection</p>
          <h2 className="mt-3 text-[28px] font-semibold leading-[1.15] md:text-[34px]">
            Modern Style
            <br />
            Meets Timeless Craft
          </h2>
          <p className="mt-4 max-w-[330px] text-[13.5px] leading-relaxed text-white/75">From classic to contemporary, find a watch that fits your story.</p>
          <Link href="/shop" className="btn-gold mt-6 self-start">
            Explore Collection <ArrowRight size={15} />
          </Link>
        </div>
        <div className="relative min-h-[220px]">
          <img src={IMAGES.collectionBanner} alt="Man in a shirt and tie wearing a gold watch" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-y-0 -left-px hidden w-44 bg-gradient-to-r from-forest to-transparent md:block" />
        </div>
      </div>
    </section>
  );
}

export function DealBanner() {
  return (
    <section className="container pt-12 md:pt-14">
      <div className="relative isolate flex min-h-[210px] flex-col justify-center overflow-hidden rounded-2xl bg-cream p-8 md:min-h-[230px] md:p-11">
        <img src={IMAGES.deal} alt="" loading="lazy" className="absolute inset-y-0 right-0 -z-20 h-full w-[60%] object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cream from-[42%] via-cream/70 via-[60%] to-transparent max-sm:via-cream/85" />
        <p className="text-[12.5px] font-medium text-ink/80">Limited Time Offer</p>
        <h2 className="mt-1 text-[30px] font-semibold leading-tight md:text-[36px]">Save Up to 50%</h2>
        <p className="mt-1.5 text-[13px] text-muted">On selected models. Don't miss out!</p>
        <Link href="/shop/category/sale" className="btn-gold mt-5 self-start">
          Shop Deals <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
