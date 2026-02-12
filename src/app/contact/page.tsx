import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Fefa team for support, order questions, and collaboration inquiries.",
};

export default function ContactPage() {
  return (
    <MainLayout>
      <section className="max-w-3xl mx-auto px-4 py-12 lg:py-16">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 text-gray-900">
            Contact Fefa
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            For anything related to your orders, products, or collaborations,
            reach out using the details below.
          </p>
        </header>

        <div className="space-y-6">
          <section className="bg-gray-50 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900">
              Customer Support
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
              For order issues, returns, refunds, or product questions:
            </p>
            <p className="text-sm md:text-base text-gray-800 font-medium">
              Email: shopfefa.world@gmail.com
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900">
              Business &amp; Collaborations
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              For partnerships, gifting collaborations, or bulk orders, write to
              us at the same email with the subject line{" "}
              <span className="font-semibold">
                “Collaboration / Wholesale – Fefa”
              </span>
              .
            </p>
          </section>

          <section className="border-t border-gray-200 pt-6 mt-4 text-sm md:text-base text-gray-600">
            <p className="leading-relaxed">
              We aim to respond to all emails within{" "}
              <span className="font-semibold">24–48 working hours</span>. During
              sale periods, replies may take slightly longer — but we do read
              and respond to every message.
            </p>
          </section>
        </div>
      </section>
    </MainLayout>
  );
}

