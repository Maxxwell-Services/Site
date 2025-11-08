import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Snowflake, AlertTriangle, CheckCircle, ShoppingCart, Home, LogIn, Calendar, User, Wrench, Info } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '../App';
import PerformanceGauge from '@/components/PerformanceGauge';
import MetricInfoModal from '@/components/MetricInfoModal';

const ViewReport = () => {
  const { uniqueLink } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [metricModalOpen, setMetricModalOpen] = useState(false);

  const openMetricInfo = (metric, status) => {
    setSelectedMetric({ metric, status });
    setMetricModalOpen(true);
  };

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
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl p-8 mb-6 border-2" style={{borderColor: '#1C325E'}}>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl shadow-lg" style={{background: 'linear-gradient(135deg, #1C325E 0%, #2a4580 100%)'}}>
                <Snowflake className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1" style={{color: '#1C325E'}}>HVAC System Performance Report</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wrench className="w-4 h-4" />
                    {report.technician_name}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate('/customer/signup')}
              variant="outline"
              className="hover:bg-orange-50"
              style={{borderColor: '#DB7218', color: '#DB7218'}}
              data-testid="signup-btn"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign Up for History
            </Button>
          </div>

          {/* Performance Score Gauge - Prominent Display */}
          <div className="bg-white rounded-xl p-6 shadow-inner border-2" style={{borderColor: 'rgba(28, 50, 94, 0.1)'}}>
            <PerformanceGauge score={report.performance_score || 0} />
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
          <div className="glass rounded-xl p-6 border-l-4" style={{borderColor: '#1C325E'}}>
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6" style={{color: '#1C325E'}} />
              <h3 className="text-xl font-bold" style={{color: '#1C325E'}}>Customer Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold" style={{color: '#1C325E'}}>{report.customer_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold" style={{color: '#1C325E'}}>{report.customer_email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold" style={{color: '#1C325E'}}>{report.customer_phone}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border-l-4" style={{borderColor: '#DB7218'}}>
            <div className="flex items-center gap-3 mb-4">
              <Snowflake className="w-6 h-6" style={{color: '#DB7218'}} />
              <h3 className="text-xl font-bold" style={{color: '#1C325E'}}>Indoor Unit / Air Handler</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Brand:</span>
                <span className="font-semibold" style={{color: '#1C325E'}}>{report.system_brand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Serial Number:</span>
                <span className="font-semibold" style={{color: '#1C325E'}}>{report.serial_number}</span>
              </div>
              {report.system_age && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">System Age:</span>
                  <span className="font-semibold" style={{color: '#1C325E'}}>{report.system_age} years</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Warranty Status:</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  report.system_warranty_status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>{report.system_warranty_status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="glass rounded-2xl p-8 mb-6 border-2" style={{borderColor: '#1C325E'}}>
          <h3 className="text-2xl font-bold mb-6 pb-3 border-b-2" style={{color: '#1C325E', borderColor: '#DB7218'}}>System Performance Metrics</h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Capacitor */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${getSeverityColor(report.capacitor_health.toLowerCase())}`}
              onClick={() => openMetricInfo('capacitor', report.capacitor_health.toLowerCase())}
              data-testid="capacitor-metric-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Capacitor</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.capacitor_health === 'Good' ? 'bg-green-200' :
                    report.capacitor_health === 'Warning' ? 'bg-orange-200' : 'bg-red-200'
                  }`}>{report.capacitor_health}</span>
                  <Info className="w-4 h-4 opacity-60" />
                </div>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Rating:</span>
                  <span className="font-semibold">{report.capacitor_rating}µF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Reading:</span>
                  <span className="font-semibold">{report.capacitor_reading}µF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Variance:</span>
                  <span className="font-semibold">{report.capacitor_tolerance.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
            </div>

            {/* Delta T */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${getSeverityColor(report.delta_t_status.toLowerCase())}`}
              onClick={() => openMetricInfo('temperature', report.delta_t_status.toLowerCase())}
              data-testid="temperature-metric-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Temperature</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.delta_t_status === 'Good' ? 'bg-green-200' :
                    report.delta_t_status === 'Warning' ? 'bg-orange-200' : 'bg-red-200'
                  }`}>{report.delta_t_status}</span>
                  <Info className="w-4 h-4 opacity-60" />
                </div>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Return Air:</span>
                  <span className="font-semibold">{report.return_temp}°F</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Supply Air:</span>
                  <span className="font-semibold">{report.supply_temp}°F</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Delta T:</span>
                  <span className="font-semibold">{report.delta_t.toFixed(1)}°F</span>
                </div>
              </div>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
            </div>

            {/* Primary Drain */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                report.primary_drain === 'Clogged, needs immediate service' 
                  ? 'bg-red-100 border-red-300 text-red-800' 
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('drain', report.primary_drain === 'Clogged, needs immediate service' ? 'critical' : 'good')}
              data-testid="drain-metric-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Primary Drain</span>
                <Info className="w-4 h-4 opacity-60" />
              </h4>
              <p className="text-sm font-medium">{report.primary_drain}</p>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
            </div>

            {/* Drain Pan Condition */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                report.drain_pan_condition === 'Rusted and should be replaced' || report.drain_pan_condition === 'Poor condition'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : report.drain_pan_condition === 'Fair condition'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('drain_pan', 
                report.drain_pan_condition === 'Rusted and should be replaced' || report.drain_pan_condition === 'Poor condition' ? 'critical' :
                report.drain_pan_condition === 'Fair condition' ? 'warning' : 'good'
              )}
              data-testid="drain-pan-metric-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Drain Pan</span>
                <Info className="w-4 h-4 opacity-60" />
              </h4>
              <p className="text-sm font-medium">{report.drain_pan_condition}</p>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
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

            {/* Air Purifier */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                report.air_purifier === 'Air purifier needs replacement'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : report.air_purifier === 'UV light needs replacement'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : report.air_purifier === 'None present'
                  ? 'bg-gray-100 border-gray-300 text-gray-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('air_purifier',
                report.air_purifier === 'Air purifier needs replacement' ? 'critical' :
                report.air_purifier === 'UV light needs replacement' ? 'warning' :
                report.air_purifier === 'None present' ? 'none' : 'good'
              )}
              data-testid="air-purifier-metric-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Air Purifier</span>
                <Info className="w-4 h-4 opacity-60" />
              </h4>
              <p className="text-sm font-medium">{report.air_purifier}</p>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
            </div>

            {/* Refrigerant */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${getSeverityColor(report.refrigerant_status.toLowerCase())}`}
              onClick={() => openMetricInfo('refrigerant', report.refrigerant_status.toLowerCase())}
              data-testid="refrigerant-metric-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Refrigerant</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.refrigerant_status === 'Good' ? 'bg-green-200' :
                    report.refrigerant_status === 'Low' ? 'bg-orange-200' : 'bg-red-200'
                  }`}>{report.refrigerant_status}</span>
                  <Info className="w-4 h-4 opacity-60" />
                </div>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Type:</span>
                  <span className="font-semibold">{report.refrigerant_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Pressure:</span>
                  <span className="font-semibold">{report.refrigerant_level} PSI</span>
                </div>
              </div>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
            </div>

            {/* Amp Draw */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${getSeverityColor(report.amp_status.toLowerCase())}`}
              onClick={() => openMetricInfo('electrical', report.amp_status.toLowerCase())}
              data-testid="electrical-metric-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Electrical</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.amp_status === 'Good' ? 'bg-green-200' :
                    report.amp_status === 'Warning' ? 'bg-orange-200' : 'bg-red-200'
                  }`}>{report.amp_status}</span>
                  <Info className="w-4 h-4 opacity-60" />
                </div>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Rated Amps:</span>
                  <span className="font-semibold">{report.rated_amps}A</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Actual Draw:</span>
                  <span className="font-semibold">{report.amp_draw}A</span>
                </div>
              </div>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
            </div>
          </div>

          {report.notes && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Technician Notes</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{report.notes}</p>
            </div>
          )}

          {report.other_repair_recommendations && (
            <div className="mt-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Other Repair Recommendations</h4>
              <p className="text-orange-800 whitespace-pre-wrap">{report.other_repair_recommendations}</p>
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
          <h3 className="text-xl font-bold mb-2" style={{color: '#1C325E'}}>Want to track your AC system health over time?</h3>
          <p className="text-gray-700 mb-4">Sign up for a free account to access report history and performance graphs</p>
          <Button 
            onClick={() => navigate('/customer/signup')} 
            className="text-white hover:opacity-90"
            style={{backgroundColor: '#DB7218'}}
            data-testid="signup-cta-btn"
          >
            Create Free Account
          </Button>
        </div>
      </div>

      {/* Metric Info Modal */}
      {selectedMetric && (
        <MetricInfoModal
          isOpen={metricModalOpen}
          onClose={() => setMetricModalOpen(false)}
          metric={selectedMetric.metric}
          status={selectedMetric.status}
        />
      )}
    </div>
  );
};

export default ViewReport;
