export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 sm:px-6">
        <p>
          Nomadant Tech Store is an academic demo storefront. Payments are
          processed with Stripe&rsquo;s test/sandbox mode only — use a{" "}
          <a
            className="font-medium text-indigo-600 hover:underline"
            href="https://docs.stripe.com/testing#cards"
            target="_blank"
            rel="noreferrer"
          >
            Stripe test card
          </a>{" "}
          such as <code className="rounded bg-slate-100 px-1 py-0.5">4242 4242 4242 4242</code>{" "}
          to complete a purchase. No real charges are ever made.
        </p>
      </div>
    </footer>
  );
}
