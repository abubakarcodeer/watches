import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({ title, subtitle, href, linkLabel = "View All", children }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 md:mb-7">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="more-link">
          {linkLabel} <ArrowRight size={15} />
        </Link>
      )}
      {children}
    </div>
  );
}
