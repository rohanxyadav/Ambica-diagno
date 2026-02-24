import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Activity } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#023E8A] to-[#0077B6] rounded-lg flex items-center justify-center shadow-lg">
                  <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#FF6B35] to-[#F77F00] rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-white" style={{fontFamily: "'Brush Script MT', cursive"}}>
                  Ambica
                </h3>
                <p className="text-xs font-semibold text-[#FF6B35] tracking-wide">DIAGNOSTIC CENTRE</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Your trusted partner for accurate diagnostic services and comprehensive health checkups.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              RTC Colony, Timurjgherry
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tests" className="hover:text-[#FF6B35] transition-colors">Tests</Link></li>
              <li><Link to="/packages" className="hover:text-[#FF6B35] transition-colors">Packages</Link></li>
              <li><Link to="/memberships" className="hover:text-[#FF6B35] transition-colors">Memberships</Link></li>
              <li><Link to="/book-appointment" className="hover:text-[#FF6B35] transition-colors">Book Appointment</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-[#FF6B35] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#FF6B35] transition-colors">Contact</Link></li>
              <li><Link to="/" className="hover:text-[#FF6B35] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-[#FF6B35] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-[#FF6B35]" />
                <span>RTC Colony, Timurjgherry, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF6B35]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF6B35]" />
                <span>info@ambicadiagnostic.com</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-[#FF6B35] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-[#FF6B35] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-[#FF6B35] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-[#FF6B35] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Ambica Diagnostic Centre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};