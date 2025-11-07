import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Snowflake, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { API, AuthContext } from '../App';

const CustomerSignup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/customer/register`, formData);
      
      login(response.data.user, response.data.token);
      toast.success('Account created successfully!');
      navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center text-blue-700 hover:text-blue-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="glass rounded-2xl p-8 fade-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-cyan-100">
                <Snowflake className="w-10 h-10 text-cyan-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Create Customer Account</h2>
            <p className="text-blue-700">Track your AC system health over time</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-blue-900">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="mt-1"
                data-testid="name-input"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-blue-900">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="mt-1"
                data-testid="email-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-blue-900">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="mt-1"
                data-testid="password-input"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/customer/login"
              className="text-blue-700 hover:text-blue-900 text-sm font-medium"
              data-testid="login-link"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;
