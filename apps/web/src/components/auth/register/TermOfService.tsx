
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"

export default function TermOfService() {
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer underline">
        Term of service
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Term of service</DialogTitle>
           <DialogDescription className="text-black text-sm">
            Redfield Gaming — Last Updated: June 23, 2026
            </DialogDescription>
    
          
        </DialogHeader>
        <div className="-mx-4 max-h-[50vh] overflow-y-auto px-4">
         

        <div className="space-y-8">
          {/* Section 1: Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Introduction</h2>
            <p className="mb-4 leading-normal text-gray-600">
              Welcome to Redfield Gaming. These Terms govern your use of our online store and the purchase of digital and physical gaming products, including video games, accessories, merchandise, and downloadable content.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              By accessing or making a purchase, you agree to these Terms and our Privacy Policy. We reserve the right to update these Terms at any time — your continued use constitutes acceptance of changes.
            </p>
          </section>

          {/* Section 2: Eligibility & Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Eligibility &amp; Accounts</h2>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Age Requirement:</strong> You must be at least 18 years old or the age of majority in your jurisdiction. Minors may use the Site only with parental consent.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Account Registration:</strong> To make purchases, you must create an account with accurate, complete, and up-to-date information including your full legal name, email address, billing address, and shipping address.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use.
            </p>
            <p className="mb-4 leading-normal text-yellow-400">
              ⚠️ We reserve the right to suspend or terminate accounts for fraudulent activity or violation of these Terms.
            </p>
          </section>

          {/* Section 3: Personal Information & Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Personal Information &amp; Privacy</h2>
            <p className="mb-4 leading-normal text-gray-600">
              We collect personal information to process orders and enhance your experience:
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Contact Information:</strong> Name, email address, phone number, billing address, shipping address.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Transaction Data:</strong> Purchase history, order details, payment method information.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Technical Data:</strong> IP address, browser type, device information, cookies.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">How we use your data:</strong> Order fulfillment, delivery updates, customer support, fraud prevention, personalization, marketing (with consent), and legal compliance.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Data sharing:</strong> We never sell your data. We share only with trusted service providers (payment gateways, shipping carriers, email platforms) under strict confidentiality.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Your rights:</strong> Access, correct, delete, restrict, or port your data. Contact us at privacy@redfieldgaming.com.
            </p>
          </section>

          {/* Section 4: Products & Pricing */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. Products &amp; Pricing</h2>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Product Descriptions:</strong> We strive for accuracy but do not warrant that descriptions are error-free.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Pricing:</strong> All prices are in USD and exclude taxes and shipping unless stated. Prices may change without notice.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Digital Products (Game Keys, DLC):</strong> Keys are delivered via email and your account dashboard. Generally non-refundable unless defective. Ensure compatibility with your gaming platform.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Physical Products (Merchandise, Collectibles):</strong> Shipped to the address you provide. Risk of loss passes to you upon carrier delivery.
            </p>
            <p className="mb-4 leading-normal text-yellow-400">
              ⚠️ We reserve the right to limit quantities, cancel orders, or refuse service at our discretion.
            </p>
          </section>

          {/* Section 5: Orders & Payment */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">5. Orders &amp; Payment</h2>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Order Acceptance:</strong> We may accept or reject orders for reasons including fraud suspicion, pricing errors, or product unavailability. Refunds issued if payment was processed.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Payment Methods:</strong> We accept major credit/debit cards (Visa, MasterCard, Amex, Discover) and PayPal.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Billing Information:</strong> You must provide accurate and current billing details. Update your account promptly to avoid delays.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              🔒 All transactions are encrypted and subject to fraud screening. We may request additional verification for high-risk orders.
            </p>
          </section>

          {/* Section 6: Shipping */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">6. Shipping &amp; Delivery</h2>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Domestic &amp; International:</strong> Physical items ship to the address you provide. Delivery estimates are not guaranteed. We are not liable for carrier delays, customs, or weather.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Shipping Costs:</strong> Calculated at checkout. You agree to pay all applicable shipping and handling fees.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Customs &amp; Duties:</strong> For international orders, you are responsible for import duties, taxes, and customs fees.
            </p>
          </section>

          {/* Section 7: Returns & Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">7. Returns &amp; Refunds</h2>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Digital Products:</strong> Generally non-refundable once delivered, unless faulty. Contact support for assistance with defective keys.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Physical Products:</strong> Returns accepted within 14 days of delivery if unused and in original packaging. Customer pays return shipping unless defective or our error.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Defective Items:</strong> Notify us within 7 days of receipt for replacement or refund.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              <strong className="text-black">Refund Processing:</strong> Approved refunds are credited to your original payment method within 5–10 business days.
            </p>
          </section>

          {/* Section 8: Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">8. Intellectual Property</h2>
            <p className="mb-4 leading-normal text-gray-600">
              All content on the Site — text, graphics, logos, images, and code — is the property of Redfield Gaming or its licensors and is protected by copyright and trademark laws.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              You may not copy, reproduce, distribute, or create derivative works without our express written consent. Game-related content (names, characters, logos) belongs to their respective copyright holders.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              ™️ Redfield Gaming is an independent retailer and is not affiliated with game publishers unless explicitly stated.
            </p>
          </section>

          {/* Section 9: Prohibited Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">9. Prohibited Conduct</h2>
            <p className="mb-4 leading-normal text-gray-600">
              When using our Site and services, you agree not to engage in fraudulent, abusive, or unlawful activities, bypass security measures, use bots or scrapers, resell or redistribute purchased products, post false or misleading content, or introduce viruses or malware.
            </p>
            <p className="mb-4 leading-normal text-red-400">
              ⚠️ Violation may result in immediate account termination, forfeiture of purchases, and legal action.
            </p>
          </section>

          {/* Section 10: Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">10. Limitation of Liability</h2>
            <p className="mb-4 leading-normal text-gray-600">
              To the maximum extent permitted by law, Redfield Gaming is not liable for indirect, incidental, special, or consequential damages, including loss of profits, data, or goodwill.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              Our total liability for any claim shall not exceed the total amount you paid to us for products in the 12 months preceding the claim.
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              ℹ️ Some jurisdictions do not allow limitation of certain damages, so these limitations may not apply to you.
            </p>
          </section>

          {/* Section 11: Contact */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">11. Contact Us</h2>
            <p className="mb-4 leading-normal text-gray-600">
              If you have questions about these Terms or your personal data, reach out to us:
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              support@redfieldgaming.com
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              privacy@redfieldgaming.com — for data privacy requests
            </p>
            <p className="mb-4 leading-normal text-gray-600">
              Redfield Gaming — Online Store
            </p>
          </section>

          {/* Footer */}
          <div className="text-left text-gray-500 text-xs border-t border-gray-700 pt-6 mt-4">
            <p>© 2026 Redfield Gaming. All rights reserved.</p>
            <p className="mt-1">By using our store, you agree to these Terms of Service and our Privacy Policy.</p>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
