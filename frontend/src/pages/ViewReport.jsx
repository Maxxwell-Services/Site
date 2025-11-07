import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Snowflake, AlertTriangle, CheckCircle, ShoppingCart, Home, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '../App';

const ViewReport = () => {
  const { uniqueLink } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
    fetchParts();
  }, [uniqueLink]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API}/reports/${uniqueLink}`);
      setReport(response.data);
    } catch (error) {
      toast.error('Report not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await axios.get(`${API}/parts`);
      setParts(response.data);
    } catch (error) {
      console.error('Failed to load parts');
    }
  };

  const getRecommendedParts = () => {
    if (!report || !report.warnings) return [];
    
    const needed = new Set();
    report.warnings.forEach(warning => {
      if (warning.part_needed) {
        needed.add(warning.part_needed);
      }
    });

    return parts.filter(part => needed.has(part.category));
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'good': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <Snowflake className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-blue-700">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-xl p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Report Not Found</h2>
          <p className="text-blue-700 mb-6">The report you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const recommendedParts = getRecommendedParts();

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Snowflake className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">AC Maintenance Report</h1>
                <p className="text-blue-700">Generated on {new Date(report.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/customer/signup')}
              variant="outline"
              className="border-cyan-600 text-cyan-700 hover:bg-cyan-50"
              data-testid="signup-btn"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign Up for History
            </Button>
          </div>
        </div>

        {/* Warnings Section */}
        {report.warnings && report.warnings.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6 border-2 border-red-300" data-testid="warnings-section">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">Attention Required</h2>
            </div>
            <div className="space-y-3">
              {report.warnings.map((warning, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-2 ${getSeverityColor(warning.severity)}`}
                  data-testid={`warning-${index}`}
                >
                  <p className="font-semibold">{warning.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer & System Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Customer Information</h3>
            <div className="space-y-2 text-blue-700">
              <p><span className="font-semibold">Name:</span> {report.customer_name}</p>
              <p><span className="font-semibold">Email:</span> {report.customer_email}</p>
              <p><span className="font-semibold">Phone:</span> {report.customer_phone}</p>
              <p><span className="font-semibold">Technician:</span> {report.technician_name}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">System Information</h3>
            <div className="space-y-2 text-blue-700">
              <p><span className="font-semibold">Brand:</span> {report.system_brand}</p>
              <p><span className="font-semibold">Serial Number:</span> {report.serial_number}</p>
              {report.system_age && (
                <p><span className="font-semibold">System Age:</span> {report.system_age} years</p>
              )}
              {report.installation_year && (
                <p><span className="font-semibold">Installation Year:</span> {report.installation_year}</p>
              )}
              <p><span className="font-semibold">Warranty Status:</span> {report.system_warranty_status}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">Performance Readings</h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Capacitor */}
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor(report.capacitor_health.toLowerCase())}`}>
              <h4 className="font-semibold mb-2">Capacitor</h4>
              <p className="text-sm">Rating: {report.capacitor_rating}µF</p>
              <p className="text-sm">Reading: {report.capacitor_reading}µF</p>
              <p className="text-sm">Tolerance: {report.capacitor_tolerance.toFixed(1)}%</p>
              <p className="text-xs mt-2 font-semibold">{report.capacitor_health}</p>
            </div>

            {/* Delta T */}
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor(report.delta_t_status.toLowerCase())}`}>
              <h4 className="font-semibold mb-2">Temperature (Delta T)</h4>
              <p className="text-sm">Return: {report.return_temp}°F</p>
              <p className="text-sm">Supply: {report.supply_temp}°F</p>
              <p className="text-sm">Delta T: {report.delta_t.toFixed(1)}°F</p>
              <p className="text-xs mt-2 font-semibold">{report.delta_t_status}</p>
            </div>

            {/* Amp Draw */}
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor(report.amp_status.toLowerCase())}`}>
              <h4 className="font-semibold mb-2">Electrical</h4>
              <p className="text-sm">Rated: {report.rated_amps}A</p>
              <p className="text-sm">Actual: {report.amp_draw}A</p>
              <p className="text-xs mt-2 font-semibold">{report.amp_status}</p>
            </div>

            {/* Refrigerant */}
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor(report.refrigerant_status.toLowerCase())}`}>
              <h4 className="font-semibold mb-2">Refrigerant</h4>
              <p className="text-sm">Type: {report.refrigerant_type}</p>
              <p className="text-sm">Level: {report.refrigerant_level} PSI</p>
              <p className="text-xs mt-2 font-semibold">{report.refrigerant_status}</p>
            </div>

            {/* Maintenance */}
            <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-300 text-blue-800">
              <h4 className="font-semibold mb-2">Maintenance</h4>
              <p className="text-sm flex items-center gap-2">
                {report.filters_replaced ? <CheckCircle className="w-4 h-4 text-green-600" /> : <span className="w-4 h-4" />}
                Filters {report.filters_replaced ? 'Replaced' : 'Not Replaced'}
              </p>
              <p className="text-sm flex items-center gap-2">
                {report.condenser_coils_cleaned ? <CheckCircle className="w-4 h-4 text-green-600" /> : <span className="w-4 h-4" />}
                Coils {report.condenser_coils_cleaned ? 'Cleaned' : 'Not Cleaned'}
              </p>
            </div>

            {/* Primary Drain */}
            <div className={`p-4 rounded-lg border-2 ${
              report.primary_drain === 'Clogged, needs immediate service' 
                ? 'bg-red-100 border-red-300 text-red-800' 
                : 'bg-green-100 border-green-300 text-green-800'
            }`}>
              <h4 className="font-semibold mb-2">Primary Drain</h4>
              <p className="text-sm">{report.primary_drain}</p>
            </div>

            {/* Drain Pan Condition */}
            <div className={`p-4 rounded-lg border-2 ${
              report.drain_pan_condition === 'Rusted and should be replaced' || report.drain_pan_condition === 'Poor condition'
                ? 'bg-red-100 border-red-300 text-red-800'
                : report.drain_pan_condition === 'Fair condition'
                ? 'bg-orange-100 border-orange-300 text-orange-800'
                : 'bg-green-100 border-green-300 text-green-800'
            }`}>
              <h4 className="font-semibold mb-2">Drain Pan Condition</h4>
              <p className="text-sm">{report.drain_pan_condition}</p>
            </div>

            {/* Air Purifier */}
            <div className={`p-4 rounded-lg border-2 ${
              report.air_purifier === 'Air purifier needs replacement'
                ? 'bg-red-100 border-red-300 text-red-800'
                : report.air_purifier === 'UV light needs replacement'
                ? 'bg-orange-100 border-orange-300 text-orange-800'
                : report.air_purifier === 'None present'
                ? 'bg-gray-100 border-gray-300 text-gray-800'
                : 'bg-green-100 border-green-300 text-green-800'
            }`}>
              <h4 className="font-semibold mb-2">Air Purifier</h4>
              <p className="text-sm">{report.air_purifier}</p>
            </div>
          </div>

          {report.notes && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Technician Notes</h4>
              <p className="text-blue-800">{report.notes}</p>
            </div>
          )}
        </div>

        {/* Recommended Parts */}
        {recommendedParts.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Recommended Parts</h3>
            <p className="text-blue-700 mb-6">Based on the inspection, the following parts are recommended:</p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedParts.map((part) => (
                <div key={part.id} className="border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                  <h4 className="font-semibold text-blue-900 mb-2">{part.name}</h4>
                  <p className="text-sm text-blue-700 mb-3">{part.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-900">${part.price.toFixed(2)}</span>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => toast.success('Added to cart!')}
                      data-testid={`purchase-btn-${part.id}`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="glass rounded-xl p-6 mt-6 text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-2">Want to track your AC system health over time?</h3>
          <p className="text-blue-700 mb-4">Sign up for a free account to access report history and performance graphs</p>
          <Button 
            onClick={() => navigate('/customer/signup')} 
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
            data-testid="signup-cta-btn"
          >
            Create Free Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewReport;
