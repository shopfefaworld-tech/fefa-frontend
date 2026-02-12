import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Jewelry Size Guide",
  description:
    "Guide to finding your ideal ring, bangle, and necklace sizes for Fefa jewelry.",
};

export default function SizeGuidePage() {
  return (
    <MainLayout>
      <section className="max-w-5xl mx-auto px-4 py-12 lg:py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 text-gray-900">
            Size Guide
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Use this guide to choose ring, bangle, and necklace sizes that fit
            comfortably and look flattering.
          </p>
        </header>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900">
              Ring Size
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
              The easiest way to find your ring size is to measure the inner
              diameter of a ring that already fits you well or to measure the
              circumference of your finger.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full text-left text-xs md:text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Indian Size</th>
                    <th className="px-4 py-3 font-semibold">
                      Inner Diameter (mm)
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Finger Circumference (mm)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {[
                    { size: "10", d: "15.9", c: "50" },
                    { size: "12", d: "16.5", c: "52" },
                    { size: "14", d: "17.2", c: "54" },
                    { size: "16", d: "17.8", c: "56" },
                    { size: "18", d: "18.5", c: "58" },
                    { size: "20", d: "19.1", c: "60" },
                  ].map((row) => (
                    <tr key={row.size}>
                      <td className="px-4 py-3">{row.size}</td>
                      <td className="px-4 py-3">{row.d}</td>
                      <td className="px-4 py-3">{row.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-3">
              Tip: Measure your finger at the end of the day and avoid measuring
              when your hands are too cold or too warm.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900">
              Bangle Size
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
              To find your bangle size, measure around the widest part of your
              hand (around the knuckles) when your thumb is tucked in, or
              compare with a bangle that already fits you.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full text-left text-xs md:text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Size</th>
                    <th className="px-4 py-3 font-semibold">
                      Inner Diameter (inches)
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Hand Circumference (cm)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {[
                    { size: "2.2", d: '2.13"', c: "18.0" },
                    { size: "2.4", d: '2.25"', c: "18.8" },
                    { size: "2.6", d: '2.38"', c: "19.7" },
                    { size: "2.8", d: '2.50"', c: "20.6" },
                    { size: "2.10", d: '2.63"', c: "21.4" },
                  ].map((row) => (
                    <tr key={row.size}>
                      <td className="px-4 py-3">{row.size}</td>
                      <td className="px-4 py-3">{row.d}</td>
                      <td className="px-4 py-3">{row.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-3">
              If you are between two sizes, choose the larger one for comfort.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900">
              Necklace Length
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
              Necklace length affects where the piece will sit on your neckline.
              Use this as a general reference:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
              <li>
                <span className="font-semibold">14–16 inches:</span> Sits close
                to the neck (choker / short necklace).
              </li>
              <li>
                <span className="font-semibold">18 inches:</span> Sits at the
                collarbone; ideal everyday length for most necklines.
              </li>
              <li>
                <span className="font-semibold">20–22 inches:</span> Sits a bit
                lower on the chest; good for layering with shorter pieces.
              </li>
              <li>
                <span className="font-semibold">24+ inches:</span> Long,
                statement lengths for layering or styling over outfits.
              </li>
            </ul>
          </section>
        </div>

        <section className="mt-10 text-sm md:text-base text-gray-600">
          <p>
            If you’re unsure between two sizes or want specific fit advice for a
            product, email us at{" "}
            <span className="font-semibold">shopfefa.world@gmail.com</span>{" "}
            with a photo or details, and we’ll guide you.
          </p>
        </section>
      </section>
    </MainLayout>
  );
}

