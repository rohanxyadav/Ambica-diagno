import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { packagesAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { IndianRupee, CheckCircle, Home } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packagesAPI.getAll();
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
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
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4" data-testid="packages-page-title">
              Health Packages
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive health checkup packages designed for your well-being
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No packages available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="p-8 hover:shadow-xl transition-all" data-testid={`package-card-${pkg.id}`}>
                  <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
                    {pkg.name}
                  </h3>
                  <p className="text-slate-600 mb-6">{pkg.description}</p>

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Included Tests:</p>
                    <ul className="space-y-2">
                      {pkg.included_tests.slice(0, 5).map((test, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span>{test}</span>
                        </li>
                      ))}
                      {pkg.included_tests.length > 5 && (
                        <li className="text-sm text-slate-500 italic">
                          +{pkg.included_tests.length - 5} more tests
                        </li>
                      )}
                    </ul>
                  </div>

                  {pkg.home_collection_available && (
                    <div className="flex items-center gap-2 text-sm text-secondary mb-6">
                      <Home className="w-4 h-4" />
                      <span>Home Collection Available</span>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <IndianRupee className="w-6 h-6 text-primary" />
                        <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                      </div>
                    </div>
                    <Link to={`/book-appointment?package=${pkg.id}`} data-testid={`book-package-${pkg.id}`}>
                      <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                        Book Package
                      </Button>
                    </Link>
                  </div>
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

export default Packages;