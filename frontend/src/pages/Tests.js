import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { testsAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, IndianRupee, Clock, Home } from 'lucide-react';
import { Card } from '../components/ui/card';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchQuery, selectedCategory, tests]);

  const fetchTests = async () => {
    try {
      const response = await testsAPI.getAll();
      setTests(response.data);
      setFilteredTests(response.data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = tests;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(test =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTests(filtered);
  };

  const categories = ['All', ...new Set(tests.map(test => test.category))];

  return (
    <div className="min-h-screen bg-neutral-background">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4" data-testid="tests-page-title">
              Diagnostic Tests
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Choose from our wide range of accurate and reliable diagnostic tests
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="tests-search-input"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-primary text-white' : ''}
                  data-testid={`category-filter-${category.toLowerCase()}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading tests...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No tests found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <Card key={test.id} className="p-6 hover:shadow-lg transition-all" data-testid={`test-card-${test.id}`}>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                      {test.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {test.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {test.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    {test.home_collection_available && (
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4 text-secondary" />
                        <span>Home Collection</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <IndianRupee className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">{test.price}</span>
                    </div>
                    <Link to={`/book-appointment?test=${test.id}`} data-testid={`book-test-${test.id}`}>
                      <Button className="bg-primary hover:bg-primary-hover text-white">
                        Book Now
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

export default Tests;
