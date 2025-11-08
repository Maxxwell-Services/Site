import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Snowflake, ClipboardCheck, User } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12 fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-white/80 backdrop-blur-sm">
                <Snowflake className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" style={{color: '#1C325E'}}>
              AC Maintenance Reports
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
              Professional seasonal maintenance reporting for air conditioning systems.
              Track performance, identify issues, and maintain optimal efficiency.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Technician Card */}
            <div 
              className="glass rounded-2xl p-8 card-hover cursor-pointer"
              onClick={() => navigate('/technician/login')}
              data-testid="technician-card"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-blue-100 mb-4">
                  <ClipboardCheck className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-3">Technicians</h2>
                <p className="text-blue-700 mb-6">
                  Create detailed maintenance reports and generate shareable links for customers
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="technician-login-btn"
                >
                  Technician Login
                </Button>
              </div>
            </div>

            {/* Customer Card */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-cyan-100 mb-4">
                  <User className="w-12 h-12 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-3">Customers</h2>
                <p className="text-blue-700 mb-6">
                  View your maintenance reports and track your AC system health over time
                </p>
                <div className="w-full space-y-3">
                  <Button 
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={() => navigate('/customer/signup')}
                    data-testid="customer-signup-btn"
                  >
                    Sign Up
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-cyan-600 text-cyan-700 hover:bg-cyan-50"
                    onClick={() => navigate('/customer/login')}
                    data-testid="customer-login-btn"
                  >
                    Already have an account?
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="glass-dark rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Comprehensive Reports</h3>
                <p className="text-sm text-blue-700">Track all critical system metrics and readings</p>
              </div>
            </div>
            <div className="text-center">
              <div className="glass-dark rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Smart Warnings</h3>
                <p className="text-sm text-blue-700">Automatic alerts for out-of-tolerance readings</p>
              </div>
            </div>
            <div className="text-center">
              <div className="glass-dark rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Parts Catalog</h3>
                <p className="text-sm text-blue-700">Direct links to purchase recommended parts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-blue-800">
        <p className="text-sm">© 2025 AC Maintenance Reports. Professional HVAC Service Solutions.</p>
      </footer>
    </div>
  );
};

export default Landing;
