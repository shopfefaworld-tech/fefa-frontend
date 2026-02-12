import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description:
    "Fefa return and refund policy, including eligibility, conditions, and process for returns and refunds.",
};

export default function ReturnsPage() {
  return (
    <MainLayout>
      <section className="max-w-4xl mx-auto px-4 py-12 lg:py-16">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Return and Refund Policy for Fefa
          </h1>
        </header>

        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
          At Fefa, we take great care in delivering premium-quality jewelry
          crafted to meet your expectations. Since our pieces are delicate and
          curated, please read this Return and Refund Policy carefully before
          making a purchase.
        </p>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Returns &amp; Refunds
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>Returns are accepted only within 48 hours of delivery.</li>
            <li>
              Returns will be considered only if the product is damaged,
              defective, or incorrect at the time of delivery.
            </li>
            <li>
              The product must be unused, unworn, and in its original condition,
              with:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Original packaging intact</li>
                <li>All tags, labels, and seals attached</li>
              </ul>
            </li>
          </ul>

          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4 mb-2">
            Returns will <span className="font-semibold">NOT</span> be accepted
            if:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>The product tag has been removed.</li>
            <li>
              The jewelry shows signs of use, damage, or alteration after
              delivery.
            </li>
            <li>The item is not returned in its original packaging.</li>
          </ul>

          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
            Due to hygiene and safety reasons, we do not accept returns for
            reasons such as change of mind or personal preference.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Mandatory Unboxing Video Requirement
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            To be eligible for a return or refund, you must:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              Record a clear unboxing video while opening the courier package in
              its sealed condition.
            </li>
            <li>
              Ensure the video shows the entire unboxing process without any
              cuts, pauses, or edits.
            </li>
            <li>
              Make sure the issue (damage, defect, or wrong item) is clearly
              visible in the video.
            </li>
            <li>
              Share the video with us when raising the return or refund request.
            </li>
          </ul>
          <p className="text-sm md:text-base text-red-700 font-medium leading-relaxed mt-3">
            No return, replacement, or refund will be processed without a proper
            unboxing video.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Refund Process
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            Once we receive and verify the returned product:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              Your refund will be issued to the original payment method used
              during purchase.
            </li>
            <li>
              Refund processing time may take 4–7 working days after successful
              verification.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Important Notes
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              Customers must report any issue within 48 hours of delivery via
              email. Requests raised after this period will not be eligible for
              return or refund.
            </li>
            <li>
              Items must be securely packed when returned to avoid damage during
              transit.
            </li>
            <li>
              Fefa reserves the right to reject returns that do not meet the
              above conditions.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-3">Contact Us</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
            For return requests or assistance, please contact us at:
          </p>
          <p className="text-sm md:text-base text-gray-800 font-medium">
            Email: shopfefa.world@gmail.com
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
            Thank you for choosing Fefa. We appreciate your trust in our jewelry
            and are committed to providing you with a beautiful and secure
            shopping experience.
          </p>
        </section>
      </section>
    </MainLayout>
  );
}

