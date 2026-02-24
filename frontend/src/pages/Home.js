import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Shield, Users, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';

const Home = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Accurate Results',
      description: 'State-of-the-art equipment ensuring precise diagnostics',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Quick Reports',
      description: 'Get your reports within 24 hours',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expert Team',
      description: 'Experienced medical professionals at your service',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Easy Booking',
      description: 'Book appointments online in minutes',
    },
  ];

  const services = [
    {
      title: 'Individual Tests',
      description: 'Wide range of diagnostic tests',
      image: 'https://images.pexels.com/photos/3908179/pexels-photo-3908179.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      link: '/tests',
    },
    {
      title: 'Health Packages',
      description: 'Comprehensive health checkup packages',
      image: 'https://images.unsplash.com/photo-1669930605340-801a0be1f5a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBtZWRpY2FsJTIwbGFib3JhdG9yeSUyMGludGVyaW9yJTIwYmx1ZSUyMHdoaXRlJTIwY2xlYW58ZW58MHx8fHwxNzcxOTMxMTg3fDA&ixlib=rb-4.1.0&q=85',
      link: '/packages',
    },
    {
      title: 'Membership Plans',
      description: 'Monthly plans for regular health monitoring',
      image: 'https://images.pexels.com/photos/7578808/pexels-photo-7578808.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      link: '/memberships',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900 leading-tight" data-testid="hero-heading">
                Your Health,
                <br />
                <span className="text-[#2A7DE1]">Our Priority</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Get accurate diagnostic services from India's most trusted diagnostic center.
                Book your appointment today and take the first step towards better health.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/book-appointment" data-testid="cta-book-appointment">
                  <Button size="lg" className="bg-[#2A7DE1] hover:bg-[#1E5FBC] text-white px-10 py-6 text-lg font-semibold shadow-lg border-2 border-[#2A7DE1] w-full sm:w-auto">
                    Book Appointment
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
                <Link to="/tests" data-testid="cta-browse-tests">
                  <Button size="lg" variant="outline" className="border-2 border-[#2A7DE1] text-[#2A7DE1] hover:bg-blue-50 px-10 py-6 text-lg font-semibold w-full sm:w-auto">
                    Browse Tests
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-[#2A7DE1]">21+</p>
                  <p className="text-sm text-gray-700 font-medium">Years Experience</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#2A7DE1]">3Lacs+</p>
                  <p className="text-sm text-gray-700 font-medium">Happy Patients</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#2A7DE1]">24hrs</p>
                  <p className="text-sm text-gray-700 font-medium">Report Delivery</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3908179/pexels-photo-3908179.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Medical Laboratory"
                  className="w-full h-auto"
                  data-testid="hero-image"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-foreground">NABL Certified</p>
                    <p className="text-sm text-slate-600">ISO 9001:2015 Accredited</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-4">
              Why Choose Ambica?
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              We combine advanced technology with compassionate care to deliver exceptional diagnostic services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-xl p-6 md:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive diagnostic solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="group"
                data-testid={`service-card-${index}`}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 mb-4">{service.description}</p>
                    <div className="flex items-center text-primary font-medium">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
            Book your appointment now and experience world-class diagnostic services
          </p>
          <Link to="/book-appointment" data-testid="cta-footer-book">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-blue-50 px-8 py-3 text-base">
              Book Appointment Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;