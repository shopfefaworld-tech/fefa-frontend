import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions governing your use of Fefa's website, products, and services.",
};

export default function TermsPage() {
  return (
    <MainLayout>
      <section className="max-w-4xl mx-auto px-4 py-12 lg:py-16">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Terms of Service for Fefa
          </h1>
        </header>

        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
          Welcome to Fefa. These Terms of Service (&quot;Terms&quot;) govern
          your access to and use of our website, products, and services. By
          visiting, browsing, or making a purchase from Fefa, you agree to be
          bound by these Terms. Please read them carefully before using our
          Services.
        </p>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            1. General Conditions
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
            By using our Services, you represent that you are at least 18 years
            old or are using the website under the supervision of a parent or
            legal guardian.
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We reserve the right to update, modify, or replace any part of
            these Terms at any time without prior notice. Your continued use of
            the Services constitutes acceptance of those changes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            2. Products and Descriptions
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Fefa offers curated jewelry pieces designed with attention to detail
            and quality. Product images and descriptions are provided for
            reference; slight variations in color, finish, or appearance may
            occur due to lighting, photography, or screen settings. Customers
            are advised to review all product details carefully before placing
            an order.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            3. Pricing and Payment
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
            All prices are listed in the applicable currency and include taxes
            unless otherwise specified.
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
            Payment must be completed in full at the time of purchase using the
            available payment methods at checkout.
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We reserve the right to change pricing at any time without prior
            notice.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            4. Shipping and Delivery
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Orders will be processed and shipped according to the timelines
            mentioned in our Shipping Policy. Fefa is not responsible for delays
            caused by courier services, unforeseen circumstances, or events
            beyond our control.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            5. Returns, Refunds, and Replacements
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Returns, refunds, and replacements are governed by our Return and
            Refund Policy. Please review the policy carefully before making a
            purchase, as jewelry items are subject to strict return conditions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            6. Prohibited Uses
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            You agree not to use our Services for any unlawful, fraudulent, or
            harmful purpose. Any attempt to interfere with the website’s
            functionality, security, or operations is strictly prohibited.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            7. Intellectual Property
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            All content on the Fefa website, including logos, product designs,
            images, text, graphics, and branding, is the property of Fefa and is
            protected by applicable intellectual property laws. Unauthorized
            use, reproduction, or distribution is strictly prohibited.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            8. Limitation of Liability
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Fefa shall not be liable for any indirect, incidental, or
            consequential damages resulting from the use of our Services or
            products to the fullest extent permitted by law.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            9. Governing Law
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            These Terms are governed by and interpreted in accordance with the
            laws of India. Any disputes arising from these Terms shall be
            subject to the exclusive jurisdiction of the courts in India.
          </p>
        </section>

        <section>
          <h2 className="text-lg md:text-xl font-semibold mb-2">10. Contact Us</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
            For any questions regarding these Terms of Service, please contact
            us at:
          </p>
          <p className="text-sm md:text-base text-gray-800 font-medium">
            Email: shopfefa.world@gmail.com
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
            Thank you for choosing Fefa.
          </p>
        </section>
      </section>
    </MainLayout>
  );
}

