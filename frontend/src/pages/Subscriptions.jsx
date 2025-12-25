import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, Crown, Zap } from 'lucide-react';

const Subscriptions = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/subscriptions/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      alert('Please login to subscribe');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/subscriptions/subscribe/${planId}`, {
        paymentMethod: 'demo',
        transactionId: 'DEMO-' + Date.now()
      });
      alert('Subscription activated successfully!');
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to subscribe');
    }
  };

  const defaultPlans = [
    {
      _id: 'free',
      name: 'Free',
      price: 0,
      duration: 365,
      propertyLimit: 1,
      description: 'Perfect for getting started',
      features: [
        '1 Property Listing',
        'Basic Support',
        '30 Days Listing Duration',
        'Standard Visibility'
      ]
    },
    {
      _id: 'basic',
      name: 'Basic',
      price: 29,
      duration: 30,
      propertyLimit: 5,
      description: 'Great for individual sellers',
      features: [
        '5 Property Listings',
        'Priority Support',
        '60 Days Listing Duration',
        'Enhanced Visibility',
        'Featured Badge'
      ]
    },
    {
      _id: 'professional',
      name: 'Professional',
      price: 79,
      duration: 30,
      propertyLimit: 20,
      description: 'Ideal for real estate agents',
      features: [
        '20 Property Listings',
        '24/7 Premium Support',
        '90 Days Listing Duration',
        'Maximum Visibility',
        'Featured Badge',
        'Analytics Dashboard',
        'Priority Placement'
      ]
    },
    {
      _id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      duration: 30,
      propertyLimit: 100,
      description: 'For real estate agencies',
      features: [
        '100 Property Listings',
        'Dedicated Account Manager',
        'Unlimited Listing Duration',
        'Premium Visibility',
        'Featured Badge',
        'Advanced Analytics',
        'API Access',
        'White Label Options',
        'Custom Branding'
      ]
    }
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Membership Plan
        </h1>
        <p className="text-xl text-gray-600">
          Unlock more features and grow your real estate business
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayPlans.map((plan, index) => (
            <div
              key={plan._id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                index === 2 ? 'ring-2 ring-blue-600 transform scale-105' : ''
              }`}
            >
              {index === 2 && (
                <div className="bg-blue-600 text-white text-center py-2 font-semibold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6">
                <div className="text-center mb-6">
                  {index === 0 && <Zap className="h-12 w-12 text-gray-400 mx-auto mb-2" />}
                  {index === 1 && <Check className="h-12 w-12 text-blue-500 mx-auto mb-2" />}
                  {index === 2 && <Crown className="h-12 w-12 text-blue-600 mx-auto mb-2" />}
                  {index === 3 && <Crown className="h-12 w-12 text-purple-600 mx-auto mb-2" />}
                  
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                    <span className="text-lg text-gray-500 font-normal">
                      {plan.price > 0 ? '/month' : ''}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan._id)}
                  disabled={plan.price === 0 || (user?.subscriptionStatus === 'active')}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                    index === 2
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {plan.price === 0 ? 'Current Plan' : 
                   user?.subscriptionStatus === 'active' ? 'Already Subscribed' : 
                   'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I change my plan later?
            </h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600">
              We accept all major credit cards and online payment methods.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Is there a refund policy?
            </h3>
            <p className="text-gray-600">
              Yes, we offer a 30-day money-back guarantee on all paid plans.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Do listings expire?
            </h3>
            <p className="text-gray-600">
              Listings are active for the duration specified in your plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
