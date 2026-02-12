import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Shipping timelines, delivery process, charges, and important notes for Fefa jewelry orders.",
};

export default function ShippingPage() {
  return (
    <MainLayout>
      <section className="max-w-4xl mx-auto px-4 py-12 lg:py-16">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Shipping Policy for Fefa
          </h1>
        </header>

        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
          At Fefa, we are committed to delivering your jewelry safely and
          efficiently. Please review our shipping policy below before placing
          your order.
        </p>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Delivery Timeline
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              All orders will be dispatched within 2 working days from the date
              of order confirmation.
            </li>
            <li>
              Once dispatched, orders are typically delivered within 5–7 working
              days depending on your location.
            </li>
            <li>Working days do not include weekends or public holidays.</li>
            <li>
              Delivery timelines may vary slightly due to courier service
              availability or external factors.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Order Confirmation &amp; Tracking
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              Once you place an order, you will receive an order confirmation
              message via email or WhatsApp.
            </li>
            <li>
              After dispatch, you will receive a tracking link to monitor your
              shipment status.
            </li>
            <li>
              The estimated delivery date shown in the tracking details is only
              an estimate and may vary slightly due to logistics conditions.
            </li>
            <li>
              Customers are requested to track their shipment regularly and be
              available to receive the delivery.
            </li>
            <li>
              Please respond to calls or messages from the delivery partner to
              avoid failed delivery attempts.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Delivery Attempts and Undelivered Orders
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>Our courier partners will attempt delivery up to three times.</li>
            <li>
              Please ensure that the correct shipping address and contact
              details are provided at checkout.
            </li>
            <li>
              If the order remains undelivered after repeated attempts due to
              customer unavailability or incorrect details, it may be returned
              to us. In such cases, re-shipping charges may apply.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Shipping Charges
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              Shipping charges, if applicable, will be calculated and shown at
              checkout.
            </li>
            <li>
              We currently ship within India. For special delivery requests, you
              may contact us directly.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Important Notes</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              All orders are carefully packed to ensure your jewelry reaches you
              in perfect condition.
            </li>
            <li>
              Delays may occur due to unforeseen circumstances such as weather
              conditions, holidays, or courier service disruptions.
            </li>
            <li>
              Fefa is not responsible for delays once the order has been handed
              over to the courier partner, but we will assist you in tracking
              and resolving issues.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg md:text-xl font-semibold mb-2">Contact Us</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
            For any shipping-related queries, please contact us at:
          </p>
          <p className="text-sm md:text-base text-gray-800 font-medium">
            Email: shopfefa.world@gmail.com
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
            Thank you for choosing Fefa. We truly appreciate your trust in our
            brand and look forward to serving you.
          </p>
        </section>
      </section>
    </MainLayout>
  );
}

