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
                <div className="p-4 rounded-full mb-4" style={{backgroundColor: 'rgba(28, 50, 94, 0.1)'}}>
                  <ClipboardCheck className="w-12 h-12" style={{color: '#1C325E'}} />
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{color: '#1C325E'}}>Technicians</h2>
                <p className="text-gray-700 mb-6">
                  Create detailed maintenance reports and generate shareable links for customers
                </p>
                <Button 
                  className="w-full text-white hover:opacity-90"
                  style={{backgroundColor: '#1C325E'}}
                  data-testid="technician-login-btn"
                >
                  Technician Login
                </Button>
              </div>
            </div>

            {/* Customer Card */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full mb-4" style={{backgroundColor: 'rgba(219, 114, 24, 0.1)'}}>
                  <User className="w-12 h-12" style={{color: '#DB7218'}} />
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{color: '#1C325E'}}>Customers</h2>
                <p className="text-gray-700 mb-6">
                  View your maintenance reports and track your AC system health over time
                </p>
                <div className="w-full space-y-3">
                  <Button 
                    className="w-full text-white hover:opacity-90"
                    style={{backgroundColor: '#DB7218'}}
                    onClick={() => navigate('/customer/signup')}
                    data-testid="customer-signup-btn"
                  >
                    Sign Up
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-gray-50"
                    style={{borderColor: '#DB7218', color: '#DB7218'}}
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
                <h3 className="font-semibold mb-2" style={{color: '#1C325E'}}>Comprehensive Reports</h3>
                <p className="text-sm text-gray-700">Track all critical system metrics and readings</p>
              </div>
            </div>
            <div className="text-center">
              <div className="glass-dark rounded-xl p-6">
                <h3 className="font-semibold mb-2" style={{color: '#1C325E'}}>Smart Warnings</h3>
                <p className="text-sm text-gray-700">Automatic alerts for out-of-tolerance readings</p>
              </div>
            </div>
            <div className="text-center">
              <div className="glass-dark rounded-xl p-6">
                <h3 className="font-semibold mb-2" style={{color: '#1C325E'}}>Parts Catalog</h3>
                <p className="text-sm text-gray-700">Direct links to purchase recommended parts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center" style={{color: '#1C325E'}}>
        <p className="text-sm">© 2025 AC Maintenance Reports. Professional HVAC Service Solutions.</p>
      </footer>
    </div>
  );
};

export default Landing;
