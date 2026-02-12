import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Frequently asked questions about Fefa jewelry, orders, shipping, and returns.",
};

const faqs = [
  {
    category: "Orders & Payments",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our collections, add your favorite pieces to cart, and complete checkout using the available payment options. You’ll receive an order confirmation by email or WhatsApp.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We support major cards, UPI, net banking, and wallet options via our secure payment partners. All payments are processed on encrypted gateways.",
      },
      {
        q: "Can I modify or cancel my order?",
        a: "If your order has not been packed or shipped, you can write to us at shopfefa.world@gmail.com with your order details. Once shipped, the order cannot be modified or cancelled.",
      },
    ],
  },
  {
    category: "Shipping",
    items: [
      {
        q: "When will my order be dispatched?",
        a: "Orders are typically dispatched within 2 working days from confirmation.",
      },
      {
        q: "How long does delivery take?",
        a: "Orders are usually delivered within 5–7 working days after dispatch, depending on your location and courier timelines.",
      },
      {
        q: "Do you offer international shipping?",
        a: "Right now, we ship within India only. If you have a special request, you can write to us and we’ll see what’s possible.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "Returns are accepted only within 48 hours of delivery and only if the product is damaged, defective, or incorrect. The jewelry must be unused, unworn, and in original packaging with all tags intact.",
      },
      {
        q: "Why is an unboxing video mandatory?",
        a: "The unboxing video helps us verify damage or incorrect items and protects both you and us from misuse. Requests without a proper, continuous unboxing video cannot be processed.",
      },
      {
        q: "How long do refunds take?",
        a: "Once we receive and verify the returned piece, refunds are typically processed to your original payment method within 4–7 working days.",
      },
    ],
  },
  {
    category: "Products & Care",
    items: [
      {
        q: "Are Fefa pieces suitable for daily wear?",
        a: "Yes, our pieces are designed for regular wear, but like all jewelry, they last longer when handled with care and kept away from harsh chemicals, perfumes, and moisture.",
      },
      {
        q: "How should I store my jewelry?",
        a: "Store your pieces in a dry place, ideally in individual pouches or boxes, to prevent scratches and tangling. Avoid direct sunlight and humidity for long periods.",
      },
      {
        q: "Will the plating last?",
        a: "Plating life depends on how often and how carefully you wear and store your jewelry. Avoid contact with water, sweat, perfumes, and lotions to extend the shine and finish.",
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <MainLayout>
      <section className="max-w-5xl mx-auto px-4 py-12 lg:py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Quick answers to the most common questions about shopping with Fefa.
          </p>
        </header>

        <div className="space-y-8">
          {faqs.map((section) => (
            <section
              key={section.category}
              className="bg-gray-50 rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
                {section.category}
              </h2>
              <dl className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.q}>
                    <dt className="text-sm md:text-base font-semibold text-gray-900">
                      {item.q}
                    </dt>
                    <dd className="text-sm md:text-base text-gray-700 leading-relaxed mt-1">
                      {item.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <section className="mt-10 text-center text-sm md:text-base text-gray-600">
          <p>
            Still not sure? Write to us at{" "}
            <span className="font-semibold">shopfefa.world@gmail.com</span> with
            your question and we’ll help you out.
          </p>
        </section>
      </section>
    </MainLayout>
  );
}

