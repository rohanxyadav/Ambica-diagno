import React from 'react';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { Award, Users, Target, Heart } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Excellence',
      description: 'Committed to delivering the highest quality diagnostic services',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Patient-Centric',
      description: 'Your health and comfort are our top priorities',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Accuracy',
      description: 'Precise results using state-of-the-art technology',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Compassion',
      description: 'Caring for every patient with empathy and understanding',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-background">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              About Ambica Diagnostic Center
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              Leading the way in diagnostic excellence with over a decade of trusted service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <img
                src="https://images.pexels.com/photos/7578808/pexels-photo-7578808.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="About Us"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">
                Your Trusted Healthcare Partner
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Ambica Diagnostic Center has been serving the community with dedication and excellence
                for over 10 years. We combine cutting-edge technology with compassionate care to provide
                accurate diagnostic services.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Our team of experienced pathologists and technicians work round the clock to ensure
                you receive timely and accurate results. We are NABL certified and follow international
                quality standards.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">10+</p>
                  <p className="text-sm text-slate-600">Years Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">50K+</p>
                  <p className="text-sm text-slate-600">Patients Served</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-sm text-slate-600">Accuracy</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground text-center mb-12">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;