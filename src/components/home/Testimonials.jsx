"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { IMAGES } from "../../data/images";

// Sample reviews: replace with real customer feedback before launch.
const REVIEWS = [
  {
    name: "James Carter",
    place: "USA",
    avatar: IMAGES.avatars.james,
    text: "Amazing quality and fast delivery! The watch is even more beautiful in person. Highly recommend WatchShop.com.",
  },
  {
    name: "Emily Roberts",
    place: "UK",
    avatar: IMAGES.avatars.emily,
    text: "Authentic products and excellent customer service. I've bought 3 watches already and every time it's been perfect!",
  },
  {
    name: "Ahmed Khan",
    place: "UAE",
    avatar: IMAGES.avatars.ahmed,
    text: "Great prices and a smooth shopping experience. Will definitely shop again!",
  },
  {
    name: "Sofia Martinez",
    place: "Spain",
    avatar: "",
    text: "My Seiko arrived beautifully packed with the box and papers. Exactly as described and a fair price.",
  },
];

export default function Testimonials() {
  const trackRef = useRef(null);
  const scroll = (dir) => {
    const el = trackRef.current;
    const card = el?.firstElementChild;
    if (card) el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: "smooth" });
  };

  return (
    <section className="container pt-12 md:pt-14">
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-7">
        <div>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="mt-1 text-[13px] text-muted">Real stories from real watch lovers.</p>
        </div>
        <div className="flex gap-2">
          {[
            { dir: -1, Icon: ChevronLeft, label: "Previous reviews" },
            { dir: 1, Icon: ChevronRight, label: "Next reviews" },
          ].map(({ dir, Icon, label }) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              aria-label={label}
              className="grid h-9 w-9 place-items-center rounded-full border border-line transition hover:border-forest hover:bg-forest hover:text-white"
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      </div>

      <ul ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto">
        {REVIEWS.map((r) => (
          <li key={r.name} className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border border-line bg-white p-5 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
            <div className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={14} className="fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-3.5 flex-1 text-[13px] leading-relaxed text-ink/80">{r.text}</p>
            <div className="mt-5 flex items-center gap-3">
              {r.avatar ? (
                <img src={r.avatar} alt="" loading="lazy" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-xs font-semibold text-white">{r.name.charAt(0)}</span>
              )}
              <p className="text-[13px] font-semibold leading-tight">
                {r.name}
                <span className="block text-[11px] font-normal text-muted">{r.place}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
