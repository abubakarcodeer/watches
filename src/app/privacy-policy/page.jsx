export const metadata = {
  title: "Privacy Policy",
  description: "Learn how WatchShop collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl py-16 md:py-24">
      <h1 className="mb-10 text-4xl md:text-5xl">Privacy Policy</h1>

      <div className="text-ink/80 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-ink mb-3 uppercase tracking-wider text-[13px]">Introduction</h2>
          <p>
            Welcome to WatchShop. We value your privacy and are committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website
            and purchase our products.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3 uppercase tracking-wider text-[13px]">Information We Collect</h2>
          <p>We collect information that you provide directly to us when you:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Place an order (Name, Email, Phone, Shipping Address)</li>
            <li>Create an account</li>
            <li>Subscribe to our newsletter</li>
            <li>Contact our customer support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3 uppercase tracking-wider text-[13px]">How We Use Your Information</h2>
          <p>We use the collected data to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you regarding your purchases</li>
            <li>Improve our website and customer service</li>
            <li>Send promotional emails (if you have opted in)</li>
            <li>Detect and prevent fraudulent transactions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3 uppercase tracking-wider text-[13px]">Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information.
            Your personal information is contained behind secured networks and is only accessible by a limited number
            of persons who have special access rights to such systems.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3 uppercase tracking-wider text-[13px]">Cookies</h2>
          <p>
            We use cookies to help us remember and process the items in your shopping cart, understand and save
            user's preferences for future visits, and compile aggregate data about site traffic.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3 uppercase tracking-wider text-[13px]">Third-Party Disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information
            unless we provide users with advance notice. This does not include website hosting partners and other
            parties who assist us in operating our website, so long as those parties agree to keep this information confidential.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3 uppercase tracking-wider text-[13px]">Contact Us</h2>
          <p>
            If there are any questions regarding this privacy policy, you may contact us using the information on our website.
          </p>
        </section>

        <p className="text-xs italic text-ink/50 pt-10">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
