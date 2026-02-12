import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Fefa collects, uses, and protects your personal information when you shop with us.",
};

export default function PrivacyPage() {
  return (
    <MainLayout>
      <section className="max-w-4xl mx-auto px-4 py-12 lg:py-16">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Privacy Policy for Fefa
          </h1>
          <p className="text-sm text-gray-500">
            Last updated on 12th Feb 2026
          </p>
        </header>

        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
          Fefa operates this store and website, including all related
          information, content, features, tools, products, and services, in
          order to provide you with a seamless shopping experience (the
          &quot;Services&quot;). This Privacy Policy describes how we collect,
          use, and disclose your personal information when you visit, use, or
          make a purchase from our Services.
        </p>
        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-8">
          By using and accessing any of the Services, you acknowledge that you
          have read and understood this Privacy Policy.
        </p>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Information We Collect
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            We collect personal information that identifies you or can
            reasonably be linked to you, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              <span className="font-semibold">Contact Details:</span> Name,
              email address, phone number, billing and shipping address.
            </li>
            <li>
              <span className="font-semibold">Payment Details:</span> Payment
              information, transaction confirmations, and purchase details
              (processed securely via third-party payment providers).
            </li>
            <li>
              <span className="font-semibold">Account Information:</span>{" "}
              Username, password, and account preferences (if you create an
              account).
            </li>
            <li>
              <span className="font-semibold">Transaction History:</span> Items
              viewed, added to cart, purchased, returned, or exchanged.
            </li>
            <li>
              <span className="font-semibold">Device &amp; Usage Data:</span> IP
              address, browser type, device information, and how you interact
              with our website.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            How We Collect Information
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            We collect information in the following ways:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              Directly from you when you place an order, sign up, or contact
              us.
            </li>
            <li>
              Automatically through cookies, analytics tools, and similar
              technologies when you browse our site.
            </li>
            <li>
              From service providers and partners who help us operate our
              business (such as payment processors, logistics partners, and
              analytics providers).
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            How We Use Your Information
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            We use your personal information to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>Process orders, payments, and deliveries.</li>
            <li>Provide customer support and respond to inquiries.</li>
            <li>
              Improve, personalize, and optimize your shopping experience.
            </li>
            <li>
              Send updates, offers, and promotional communications (you may opt
              out at any time).
            </li>
            <li>
              Detect fraud, enhance security, and comply with legal obligations.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            How We Share Information
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            We only share your information when necessary, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>
              With trusted service providers (payment gateways, shipping
              partners, website hosting, analytics).
            </li>
            <li>
              With marketing and advertising partners, where permitted by law.
            </li>
            <li>
              To comply with legal requirements, enforce our terms, or protect
              our rights and customers.
            </li>
          </ul>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-3">
            We do not sell your personal information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Cookies &amp; Tracking Technologies
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            Fefa uses cookies and similar technologies to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>Ensure the website functions properly.</li>
            <li>Analyze traffic and improve performance.</li>
            <li>Provide relevant advertising and personalized content.</li>
          </ul>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-3">
            You can manage or disable cookies through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Your Rights
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            Depending on your location, you may have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
            <li>Access, update, or delete your personal data.</li>
            <li>Request a copy of the data we hold about you.</li>
            <li>Opt out of marketing communications.</li>
            <li>Restrict or object to certain data processing activities.</li>
          </ul>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-3">
            To exercise your rights, please contact us using the details below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Data Security &amp; Retention
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
            We implement appropriate technical and organizational measures to
            protect your personal information. While we strive to use
            commercially acceptable means to safeguard your data, no method of
            transmission over the internet is 100% secure.
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We retain your information only as long as necessary to provide
            Services and comply with legal, tax, or regulatory requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            International Data Transfers
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Your information may be processed or stored outside your country of
            residence. Where this occurs, we ensure appropriate safeguards are
            in place to protect your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Changes to This Policy
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with the revised effective date.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-3">Contact Us</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
            If you have questions, concerns, or requests related to this
            Privacy Policy, please contact us at:
          </p>
          <p className="text-sm md:text-base text-gray-800 font-medium">
            Email: shopfefa.world@gmail.com
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
            Thank you for trusting Fefa.
          </p>
        </section>
      </section>
    </MainLayout>
  );
}

