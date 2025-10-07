import Link from 'next/link';
import { Check } from 'lucide-react';

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  href?: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals testing Postlin',
    features: ['AI suggestions (limited)', '1 connected LinkedIn account', 'Basic analytics'],
    href: '/login',
  },
  {
    name: 'Pro',
    price: '$12/mo',
    description: 'For power users and professionals',
    features: ['Unlimited AI generations', 'Schedule posts', 'Advanced analytics', 'Priority support'],
    href: '/login',
  },
  {
    name: 'Team',
    price: '$49/mo',
    description: 'For small teams and agencies',
    features: ['All Pro features', 'Team seats', 'Shared workspace', 'SAML / SSO (coming soon)'],
    href: '/login',
  },
];

export default function Pricing({ isAuthenticated }: { isAuthenticated?: boolean }) {
  return (
    <section id="pricing" className="max-w-7xl mx-auto my-16 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold">Pricing that grows with you</h2>
        <p className="text-gray-600 mt-2">Simple, transparent pricing. Upgrade or cancel anytime.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{plan.price}</div>
                <div className="text-sm text-gray-500">billed monthly</div>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-1" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href={isAuthenticated ? '/dashboard/drafts' : (plan.href ?? '/login')}
                className="block text-center w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                {isAuthenticated ? 'Open Dashboard' : plan.name === 'Free' ? 'Get Started' : 'Choose Plan'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
