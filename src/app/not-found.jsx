import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-32 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">404</p>
      <h1 className="mt-3 text-5xl">Page not found</h1>
      <Link href="/" className="btn-dark mt-8">
        Back Home
      </Link>
    </div>
  );
}
