import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import Logo from '../Logo';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tests', path: '/tests' },
    { name: 'Packages', path: '/packages' },
    { name: 'Memberships', path: '/memberships' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#023E8A] to-[#0077B6] rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#FF6B35] to-[#F77F00] rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-[#023E8A] to-[#0077B6] bg-clip-text text-transparent" style={{fontFamily: "'Brush Script MT', cursive"}}>
                Ambica
              </h1>
              <p className="text-xs font-semibold text-[#FF6B35] tracking-wide">DIAGNOSTIC CENTRE</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-slate-600 hover:text-[#023E8A] transition-colors font-medium"
                data-testid={`nav-link-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} data-testid="dashboard-link">
                  <Button variant="ghost" className="flex items-center gap-2 hover:text-[#023E8A]">
                    <LayoutDashboard className="w-4 h-4" />
                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:text-[#023E8A]"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="login-link">
                  <Button variant="ghost" className="hover:text-[#023E8A]">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/book-appointment" data-testid="book-appointment-header">
                  <Button className="bg-gradient-to-r from-[#023E8A] to-[#0077B6] hover:from-[#002855] hover:to-[#005A8C] text-white shadow-md">
                    Book Appointment
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-slate-600 hover:text-[#023E8A]"
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-link-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="block py-2 text-slate-600 hover:text-[#023E8A]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-slate-600 hover:text-[#023E8A]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-slate-600 hover:text-[#023E8A]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/book-appointment"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-gradient-to-r from-[#023E8A] to-[#0077B6] hover:from-[#002855] hover:to-[#005A8C] text-white">
                    Book Appointment
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};