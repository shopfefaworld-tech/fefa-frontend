import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "About Fefa",
  description:
    "Discover the story, values, and craftsmanship behind Fefa jewelry.",
};

export default function AboutPage() {
  return (
    <MainLayout>
      <section className="max-w-5xl mx-auto px-4 py-12 lg:py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 text-gray-900">
            About Fefa
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Fefa is built for modern Indian women who want everyday jewelry that
            feels effortless, premium, and personal.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900">
              Our Story
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
              Fefa was created with a simple idea: jewelry should be as
              comfortable as your favorite outfit and as special as your
              favorite memory. We design pieces that you can wear to work, to a
              coffee date, or to a celebration — without feeling overdressed or
              underwhelmed.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Every collection is thoughtfully curated, with attention to
              finish, comfort, and longevity. Our goal is to make premium-looking
              jewelry accessible, so you can build a capsule collection you
              actually reach for every day.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">
              What We Care About
            </h2>
            <ul className="space-y-3 text-sm md:text-base text-gray-700">
              <li>
                <span className="font-semibold">Everyday wearability:</span>{" "}
                Lightweight, comfortable designs that work from AM to PM.
              </li>
              <li>
                <span className="font-semibold">Thoughtful detailing:</span>{" "}
                Finishes and forms that look premium up close, not just in
                photos.
              </li>
              <li>
                <span className="font-semibold">Honest communication:</span>{" "}
                Clear policies on shipping, returns, and care — no hidden fine
                print.
              </li>
            </ul>
          </section>
        </div>

        <section className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900">
            For the Modern Indian Woman
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            Fefa is for women who balance work, family, and personal style —
            who want jewelry that keeps up with their life, not just their
            Instagram feed. Our pieces are designed to layer, repeat, and
            travel with you.
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We’re still early in our journey and constantly improving — adding
            more styles, refining quality, and listening closely to what you
            actually wear and love.
          </p>
        </section>

        <section className="mt-10 bg-gray-50 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900">
            Stay Connected
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
            Have feedback, ideas, or a story to share? We’d love to hear from
            you.
          </p>
          <p className="text-sm md:text-base text-gray-800 font-medium">
            Email: shopfefa.world@gmail.com
          </p>
        </section>
      </section>
    </MainLayout>
  );
}

