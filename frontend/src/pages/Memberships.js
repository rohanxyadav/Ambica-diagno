import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { membershipsAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { IndianRupee, CheckCircle, Star } from 'lucide-react';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await membershipsAPI.getAll();
      setMemberships(response.data);
    } catch (error) {
      console.error('Failed to fetch memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-background">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4" data-testid="memberships-page-title">
              Membership Plans
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Subscribe to our monthly plans for regular health monitoring and exclusive benefits
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading plans...</p>
            </div>
          ) : memberships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No membership plans available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {memberships.map((membership, index) => (
                <Card 
                  key={membership.id} 
                  className={`p-8 hover:shadow-xl transition-all relative overflow-hidden ${
                    index === 1 ? 'border-2 border-primary' : ''
                  }`}
                  data-testid={`membership-card-${membership.id}`}
                >
                  {index === 1 && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Popular
                      </div>
                    </div>
                  )}

                  <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
                    {membership.name}
                  </h3>
                  <p className="text-slate-600 mb-6">{membership.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <IndianRupee className="w-6 h-6 text-primary" />
                      <span className="text-4xl font-bold text-primary">{membership.monthly_price}</span>
                      <span className="text-slate-600 ml-2">/month</span>
                    </div>
                    <p className="text-sm text-secondary font-semibold">
                      Save {membership.discount_percentage}% on all tests
                    </p>
                  </div>

                  <div className="mb-8">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Benefits:</p>
                    <ul className="space-y-3">
                      {membership.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className={`w-full ${
                      index === 1 
                        ? 'bg-primary hover:bg-primary-hover text-white' 
                        : 'bg-white border-2 border-primary text-primary hover:bg-blue-50'
                    }`}
                    data-testid={`subscribe-membership-${membership.id}`}
                  >
                    Subscribe Now
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Memberships;