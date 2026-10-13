import Link from "next/link";

export const metadata = {
  title: "Help Centre",
  description: "About WatchShop, shipping, returns and exchanges, the watch size guide, warranty and frequently asked questions.",
};

// Starter copy: review every policy below before launch so it matches how the store really operates.
const SECTIONS = [
  {
    id: "about",
    title: "About Us",
    body: [
      "WatchShop brings the world's most trusted watch brands together in one place. From everyday quartz pieces to Swiss automatics, every watch we sell is authentic and supplied with its original box and papers.",
      "We are collectors ourselves, so we pack, check and ship every order the way we would want to receive it.",
    ],
  },
  {
    id: "shipping",
    title: "Shipping Info",
    list: [
      "Orders are dispatched within 1–2 working days.",
      "Standard delivery takes 3–5 working days. You will get a confirmation message once your order ships.",
      "Delivery is free above the threshold shown in your cart; a flat fee applies below it.",
      "Every parcel is insured and requires a signature on delivery.",
    ],
  },
  {
    id: "returns",
    title: "Returns & Exchanges",
    list: [
      "Return or exchange any unworn watch within 7 days of delivery.",
      "Watches must come back in original condition, with protective films, tags, box and papers.",
      "Sized bracelets, engraved pieces and opened smartwatches cannot be returned unless faulty.",
      "Contact us with your order number to start a return.",
    ],
  },
  {
    id: "size-guide",
    title: "Size Guide",
    body: ["Case diameter is the quickest way to judge how a watch will wear. Measure your wrist just below the wrist bone and use the table as a starting point."],
    table: [
      ["Wrist size", "Suggested case", "Wears as"],
      ["Under 15 cm", "28 – 36 mm", "Small / classic"],
      ["15 – 17 cm", "36 – 40 mm", "Medium"],
      ["17 – 19 cm", "40 – 44 mm", "Large / sport"],
      ["Over 19 cm", "44 mm and up", "Oversized"],
    ],
  },
  {
    id: "warranty",
    title: "Warranty",
    list: [
      "Every watch carries a 2-year warranty covering manufacturing defects in the movement.",
      "Batteries, straps, glass and damage from accidents or water beyond the rated depth are not covered.",
      "Keep your order confirmation: it is your proof of purchase for any claim.",
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    faqs: [
      ["Are your watches authentic?", "Yes. Every watch is sourced from authorised channels and ships with its original box, papers and serial number."],
      ["How do I track my order?", "Sign in and open My Account to see the live status of every order you have placed."],
      ["Can I change or cancel an order?", "Contact us as soon as possible. Orders can be changed until they are marked as shipped."],
      ["Do you resize bracelets?", "Tell us your wrist size in the order notes and we will remove links before dispatch, free of charge."],
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="container py-10 md:py-14">
      <div className="rounded-2xl bg-forest px-6 py-10 text-center text-white md:py-12">
        <p className="eyebrow text-gold">Customer Service</p>
        <h1 className="mt-2 text-3xl md:text-[40px]">Help Centre</h1>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Help topics" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium transition hover:border-forest hover:text-forest lg:border-0">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="text-2xl">{s.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/80">
                {s.body?.map((p) => <p key={p}>{p}</p>)}
                {s.list && (
                  <ul className="space-y-2.5">
                    {s.list.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.table && (
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[420px] text-left">
                      <thead className="bg-sand text-xs uppercase tracking-wider text-muted">
                        <tr>{s.table[0].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {s.table.slice(1).map((row) => (
                          <tr key={row[0]} className="border-t border-line">
                            {row.map((cell) => <td key={cell} className="px-4 py-3">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {s.faqs && (
                  <dl className="divide-y divide-line border-y border-line">
                    {s.faqs.map(([q, a]) => (
                      <div key={q} className="py-4">
                        <dt className="font-semibold text-ink">{q}</dt>
                        <dd className="mt-1.5">{a}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </section>
          ))}

          <p className="rounded-2xl bg-cream p-6 text-sm">
            Still need help?{" "}
            <Link href="/contact" className="font-semibold text-forest link-underline">Contact our team</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
