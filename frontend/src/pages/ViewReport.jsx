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
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [displayData, setDisplayData] = useState(null);

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
      const response = await axios.get(`${API}/reports/view/${uniqueLink}`);
      setReport(response.data);
      // Set initial version - show current version by default
      setSelectedVersion(response.data.current_version || 1);
      setDisplayData(response.data);
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

  const handleVersionChange = (version) => {
    setSelectedVersion(version);
    
    if (!report) return;
    
    // If selecting current version, use the main report data
    if (version === report.current_version || !report.versions || report.versions.length === 0) {
      setDisplayData(report);
    } else {
      // Find the version data from versions array
      const versionData = report.versions.find(v => v.version === version);
      if (versionData && versionData.data) {
        setDisplayData(versionData.data);
      }
    }
  };

  const getVersionLabel = (versionNum) => {
    if (!report || !report.versions) return `Version ${versionNum}`;
    
    const versionData = report.versions.find(v => v.version === versionNum);
    return versionData ? versionData.label : `Version ${versionNum}`;
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
  
  // Use displayData if available, otherwise fallback to report
  const currentData = displayData || report;

  return (
    <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border-2" style={{borderColor: '#1C325E'}}>
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0" style={{background: 'linear-gradient(135deg, #1C325E 0%, #2a4580 100%)'}}>
                <Snowflake className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1" style={{color: '#1C325E'}}>HVAC System Performance Report</h1>
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
            <PerformanceGauge score={displayData?.performance_score || report.performance_score || 0} />
          </div>
        </div>

        {/* Version Selector */}
        {report.versions && report.versions.length > 0 && (
          <div className="glass rounded-xl p-4 mb-6 border-2" style={{borderColor: '#1C325E'}}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Report Version</h3>
                <p className="text-sm text-gray-600">
                  {report.versions.find(v => v.version === selectedVersion)?.timestamp 
                    ? new Date(report.versions.find(v => v.version === selectedVersion)?.timestamp).toLocaleString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })
                    : new Date(report.created_at).toLocaleString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })
                  }
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(Math.max(report.current_version || 1, report.versions.length))].map((_, i) => {
                  const versionNum = i + 1;
                  const versionExists = versionNum === 1 || report.versions.some(v => v.version === versionNum);
                  if (!versionExists) return null;
                  
                  return (
                    <Button
                      key={versionNum}
                      onClick={() => handleVersionChange(versionNum)}
                      variant={selectedVersion === versionNum ? "default" : "outline"}
                      size="sm"
                      className={selectedVersion === versionNum ? "" : "hover:bg-blue-50"}
                      style={selectedVersion === versionNum ? {backgroundColor: '#1C325E'} : {borderColor: '#1C325E', color: '#1C325E'}}
                    >
                      {getVersionLabel(versionNum)}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Warnings Section */}
        {displayData?.warnings && displayData.warnings.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6 border-2 border-red-300" data-testid="warnings-section">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">Attention Required</h2>
            </div>
            <div className="space-y-3">
              {displayData.warnings.map((warning, index) => (
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

        {/* Customer & System Info - Unified Layout */}
        <div className="glass rounded-2xl p-6 sm:p-8 mb-6 border-2" style={{borderColor: '#1C325E'}}>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2" style={{color: '#1C325E', borderColor: '#DB7218'}}>
            Service Information
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Customer Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5" style={{color: '#1C325E'}} />
                <h3 className="text-lg font-semibold" style={{color: '#1C325E'}}>Customer</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Name</span>
                  <p className="font-semibold" style={{color: '#1C325E'}}>{currentData.customer_name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Email</span>
                  <p className="font-semibold text-sm" style={{color: '#1C325E'}}>{currentData.customer_email}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
                  <p className="font-semibold" style={{color: '#1C325E'}}>{currentData.customer_phone}</p>
                </div>
              </div>
            </div>

            {/* Indoor Unit / Air Handler */}
            <div className="border-l-2 pl-6" style={{borderColor: '#DB7218'}}>
              <div className="flex items-center gap-2 mb-4">
                <Snowflake className="w-5 h-5" style={{color: '#DB7218'}} />
                <h3 className="text-lg font-semibold" style={{color: '#1C325E'}}>Indoor Unit (Evaporator)</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Brand</span>
                  <p className="font-semibold" style={{color: '#1C325E'}}>{currentData.evaporator_brand}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Model Number</span>
                  <p className="font-semibold text-sm" style={{color: '#1C325E'}}>{currentData.evaporator_model_number}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</span>
                  <p className="font-semibold text-sm" style={{color: '#1C325E'}}>{currentData.evaporator_serial_number}</p>
                </div>
                {currentData.evaporator_date_of_manufacture && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Manufactured</span>
                    <p className="font-semibold text-sm" style={{color: '#1C325E'}}>{currentData.evaporator_date_of_manufacture}</p>
                  </div>
                )}
                {currentData.evaporator_age && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Age</span>
                    <p className="font-semibold" style={{color: '#1C325E'}}>{currentData.evaporator_age}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Warranty</span>
                  <div className="mt-1">
                    <span className={`inline-block font-semibold px-3 py-1 rounded-full text-xs ${
                      currentData.evaporator_warranty_status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>{currentData.evaporator_warranty_status}</span>
                    {currentData.evaporator_warranty_details && (
                      <p className="text-xs text-gray-600 mt-1">{currentData.evaporator_warranty_details}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Condenser Unit */}
            <div className="border-l-2 pl-6" style={{borderColor: '#DB7218'}}>
              <div className="flex items-center gap-2 mb-4">
                <Snowflake className="w-5 h-5" style={{color: '#DB7218'}} />
                <h3 className="text-lg font-semibold" style={{color: '#1C325E'}}>Condenser Unit</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Brand</span>
                  <p className="font-semibold" style={{color: '#1C325E'}}>{currentData.condenser_brand}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Model Number</span>
                  <p className="font-semibold text-sm" style={{color: '#1C325E'}}>{currentData.condenser_model_number}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</span>
                  <p className="font-semibold text-sm" style={{color: '#1C325E'}}>{currentData.condenser_serial_number}</p>
                </div>
                {currentData.condenser_date_of_manufacture && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Manufactured</span>
                    <p className="font-semibold text-sm" style={{color: '#1C325E'}}>{currentData.condenser_date_of_manufacture}</p>
                  </div>
                )}
                {currentData.condenser_age && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Age</span>
                    <p className="font-semibold" style={{color: '#1C325E'}}>{currentData.condenser_age}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Warranty</span>
                  <div className="mt-1">
                    <span className={`inline-block font-semibold px-3 py-1 rounded-full text-xs ${
                      currentData.condenser_warranty_status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>{currentData.condenser_warranty_status}</span>
                    {currentData.condenser_warranty_details && (
                      <p className="text-xs text-gray-600 mt-1">{currentData.condenser_warranty_details}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="glass rounded-2xl p-8 mb-6 border-2" style={{borderColor: '#1C325E'}}>
          <h3 className="text-2xl font-bold mb-6 pb-3 border-b-2" style={{color: '#1C325E', borderColor: '#DB7218'}}>System Performance Metrics</h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blower Motor Capacitor - Only show if PSC Motor */}
            {currentData.blower_motor_type === "PSC Motor" && currentData.blower_motor_capacitor_health && (
              <div 
                className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${getSeverityColor(currentData.blower_motor_capacitor_health.toLowerCase())}`}
                onClick={() => openMetricInfo('capacitor', currentData.blower_motor_capacitor_health.toLowerCase())}
                data-testid="blower-capacitor-metric-card"
              >
                <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                  <span>Blower Motor Capacitor</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      currentData.blower_motor_capacitor_health === 'Good' ? 'bg-green-200' :
                      currentData.blower_motor_capacitor_health === 'Warning' ? 'bg-orange-200' : 'bg-red-200'
                    }`}>{currentData.blower_motor_capacitor_health}</span>
                    <Info className="w-4 h-4 opacity-60" />
                  </div>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Rating:</span>
                    <span className="font-semibold">{currentData.blower_motor_capacitor_rating}µF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Reading:</span>
                    <span className="font-semibold">{currentData.blower_motor_capacitor_reading}µF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Variance:</span>
                    <span className="font-semibold">{currentData.blower_motor_capacitor_tolerance?.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
              </div>
            )}

            {/* Condenser Fan Motor */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                report.condenser_fan_motor === 'Inoperative' 
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : report.condenser_fan_motor === 'Motor Vibration' || report.condenser_fan_motor === 'Blade Vibration'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('condenser_fan_motor', 
                report.condenser_fan_motor === 'Inoperative' ? 'critical' :
                report.condenser_fan_motor === 'Motor Vibration' || report.condenser_fan_motor === 'Blade Vibration' ? 'warning' : 'good'
              )}
              data-testid="condenser-fan-motor-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Condenser Fan Motor</span>
                <Info className="w-4 h-4 opacity-60" />
              </h4>
              <p className="text-sm font-medium">{report.condenser_fan_motor}</p>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
            </div>

            {/* Condenser Dual Run Capacitor */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${getSeverityColor(report.condenser_capacitor_health.toLowerCase())}`}
              onClick={() => openMetricInfo('capacitor', report.condenser_capacitor_health.toLowerCase())}
              data-testid="condenser-capacitor-metric-card"
            >
              <h4 className="font-bold mb-3 text-lg flex items-center justify-between">
                <span>Condenser Dual Run Capacitor</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.condenser_capacitor_health === 'Good' ? 'bg-green-200' :
                    report.condenser_capacitor_health === 'Warning' ? 'bg-orange-200' : 'bg-red-200'
                  }`}>{currentData.condenser_capacitor_health}</span>
                  <Info className="w-4 h-4 opacity-60" />
                </div>
              </h4>
              <div className="space-y-3">
                {/* Herm Terminal */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Common to Herm Terminal</div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Rating:</span>
                    <span className="font-semibold">{currentData.condenser_capacitor_herm_rating}µF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Reading:</span>
                    <span className="font-semibold">{currentData.condenser_capacitor_herm_reading}µF</span>
                  </div>
                </div>
                {/* Fan Terminal */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Common to Fan Terminal</div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Rating:</span>
                    <span className="font-semibold">{currentData.condenser_capacitor_fan_rating}µF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Reading:</span>
                    <span className="font-semibold">{currentData.condenser_capacitor_fan_reading}µF</span>
                  </div>
                </div>
                {/* Overall Variance */}
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Max Variance:</span>
                  <span className="font-semibold">{currentData.condenser_capacitor_tolerance.toFixed(1)}%</span>
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
                  }`}>{currentData.delta_t_status}</span>
                  <Info className="w-4 h-4 opacity-60" />
                </div>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Return Air:</span>
                  <span className="font-semibold">{currentData.return_temp}°F</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Supply Air:</span>
                  <span className="font-semibold">{currentData.supply_temp}°F</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Delta T:</span>
                  <span className="font-semibold">{currentData.delta_t.toFixed(1)}°F</span>
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
              <p className="text-sm font-medium">{currentData.primary_drain}</p>
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
              <p className="text-sm font-medium">{currentData.drain_pan_condition}</p>
              <p className="text-xs mt-3 opacity-70 italic">Click for more information</p>
            </div>

            {/* Maintenance section removed */}

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
              <p className="text-sm font-medium">{currentData.air_purifier}</p>
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
                  }`}>{currentData.refrigerant_status}</span>
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

            {/* Electrical section removed */}
          </div>

          {currentData.notes && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Technician Notes</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{currentData.notes}</p>
            </div>
          )}

          {currentData.other_repair_recommendations && (
            <div className="mt-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Other Repair Recommendations</h4>
              <p className="text-orange-800 whitespace-pre-wrap">{currentData.other_repair_recommendations}</p>
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
