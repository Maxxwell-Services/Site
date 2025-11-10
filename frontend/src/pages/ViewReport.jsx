import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Snowflake, AlertTriangle, CheckCircle, ShoppingCart, Home, LogIn, Calendar, User, Wrench, Info, Droplets, Thermometer, Wind, Zap, Filter, Flame, ArrowDownUp, Gauge, Camera, X, Triangle, Square, Plug2, Fan, Network, Container, Layers, Wind as AirFlow, Refrigerator, Search, AlertCircle } from 'lucide-react';
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
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoModalTitle, setPhotoModalTitle] = useState('');
  const [enlargedPhotoIndex, setEnlargedPhotoIndex] = useState(null);

  const openMetricInfo = (metric, status) => {
    setSelectedMetric({ metric, status });
    setMetricModalOpen(true);
  };

  const openPhotoModal = (photos, title) => {
    if (photos && photos.length > 0) {
      setSelectedPhotos(photos);
      setPhotoModalTitle(title);
      setPhotoModalOpen(true);
    }
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
    // All cards now have neutral styling
    return 'bg-white border-gray-300';
  };

  const getStatusIcon = (status) => {
    if (status === 'Good' || status === 'Clean' || status === 'Draining properly') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (status === 'Warning' || status === 'Slightly dirty' || status === 'Slow drainage' || status === 'Some buildup') {
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
    if (status === 'Critical' || status === 'Very dirty' || status === 'Clogged' || status === 'Rusty or cracked' || status === 'Low') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return null;
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
        // Merge version data with current report to fill in missing fields (like photos, system info)
        // This ensures UI doesn't break when viewing older versions with limited data
        setDisplayData({
          ...report,  // Start with current report (has all fields including photos)
          ...versionData.data  // Override with version-specific data (metrics, status)
        });
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

  // Calculate System Performance Score with impact-based penalties
  const calculateSystemPerformance = () => {
    let performanceScore = 100; // Start at 100%
    
    // Air Filters - 15% impact
    if (currentData.air_filters) {
      const needsReplacement = ['Customer will replace the filters soon', 'Tech will return to replace filters'];
      if (needsReplacement.includes(currentData.air_filters)) {
        performanceScore -= 15;
      }
    }
    
    // Capacitors - 20% impact each
    if (currentData.blower_motor_type === "PSC Motor" && currentData.blower_motor_capacitor_health) {
      if (currentData.blower_motor_capacitor_health === 'Critical') performanceScore -= 20;
      else if (currentData.blower_motor_capacitor_health === 'Warning') performanceScore -= 10;
    }
    
    if (currentData.condenser_capacitor_health) {
      if (currentData.condenser_capacitor_health === 'Critical') performanceScore -= 20;
      else if (currentData.condenser_capacitor_health === 'Warning') performanceScore -= 10;
    }
    
    // Refrigerant - 25% impact (highest priority)
    if (currentData.refrigerant_status) {
      if (currentData.refrigerant_status === 'Critical') performanceScore -= 25;
      else if (currentData.refrigerant_status === 'Low') performanceScore -= 15;
    }
    
    // Delta T / Temperature - 15% impact
    if (currentData.delta_t_status) {
      if (currentData.delta_t_status === 'Critical') performanceScore -= 15;
      else if (currentData.delta_t_status === 'Warning') performanceScore -= 8;
    }
    
    // Coils - 10% impact each
    if (currentData.evaporator_coil) {
      if (currentData.evaporator_coil === 'Very dirty') performanceScore -= 10;
      else if (currentData.evaporator_coil === 'Slightly dirty') performanceScore -= 5;
    }
    
    if (currentData.condenser_coils) {
      if (currentData.condenser_coils === 'Very dirty') performanceScore -= 10;
      else if (currentData.condenser_coils === 'Slightly dirty') performanceScore -= 5;
    }
    
    // Drainage - 10% impact
    if (currentData.primary_drain) {
      if (currentData.primary_drain === 'Clogged') performanceScore -= 10;
      else if (currentData.primary_drain === 'Slow drainage') performanceScore -= 5;
    }
    
    if (currentData.drain_pan_condition) {
      if (currentData.drain_pan_condition === 'Rusty or cracked') performanceScore -= 8;
      else if (currentData.drain_pan_condition === 'Some buildup') performanceScore -= 3;
    }
    
    // Ensure score doesn't go below 0
    return Math.max(0, Math.round(performanceScore));
  };
  
  const systemPerformanceScore = calculateSystemPerformance();
  
  // System Health = 100 - Deficiencies (they add up to 100%)
  // Deficiencies are calculated from warnings and issues
  const calculateDeficiencies = () => {
    let deficiencyPoints = 0;
    
    // Count warnings (each warning = 15 points)
    deficiencyPoints += (currentData?.warnings?.length || 0) * 15;
    
    // Add points for critical issues not in warnings
    if (currentData.air_filters === 'Tech will return to replace filters') deficiencyPoints += 5;
    if (currentData.refrigerant_status === 'Critical' || currentData.refrigerant_status === 'Low') deficiencyPoints += 10;
    if (currentData.primary_drain === 'Clogged') deficiencyPoints += 10;
    
    return Math.min(100, deficiencyPoints);
  };
  
  const deficienciesPercentage = calculateDeficiencies();
  const systemHealthScore = 100 - deficienciesPercentage; // Health and Deficiencies add up to 100%

  return (
    <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8" style={{backgroundColor: '#f8f9fa'}}>
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border" style={{borderColor: '#e5e7eb'}}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{backgroundColor: '#1C325E'}}>
                <Snowflake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{color: '#1C325E'}}>AC SYSTEM STATUS</h1>
                <p className="text-sm text-gray-600">Report Date: {new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/customer/signup')}
              variant="outline"
              size="sm"
              className="hover:bg-orange-50"
              style={{borderColor: '#DB7218', color: '#DB7218'}}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign Up
            </Button>
          </div>
        </div>

        {/* Version Selector */}
        {report.versions && report.versions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-3 mb-4 border" style={{borderColor: '#e5e7eb'}}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{color: '#1C325E'}} />
                <span className="text-xs font-medium" style={{color: '#1C325E'}}>Version:</span>
                <span className="text-xs text-gray-600">
                  {report.versions.find(v => v.version === selectedVersion)?.timestamp 
                    ? new Date(report.versions.find(v => v.version === selectedVersion)?.timestamp).toLocaleDateString()
                    : new Date(report.created_at).toLocaleDateString()
                  }
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[...Array(Math.max(report.current_version || 1, report.versions.length))].map((_, i) => {
                  const versionNum = i + 1;
                  const versionExists = versionNum === 1 || report.versions.some(v => v.version === versionNum);
                  if (!versionExists) return null;
                  
                  return (
                    <button
                      key={versionNum}
                      onClick={() => handleVersionChange(versionNum)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        selectedVersion === versionNum 
                          ? 'text-white' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      style={selectedVersion === versionNum ? {backgroundColor: '#1C325E'} : {border: '1px solid #e5e7eb', color: '#1C325E'}}
                    >
                      {getVersionLabel(versionNum)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-4">
            {/* System Performance Score Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border" style={{borderColor: '#e5e7eb'}}>
              <h2 className="text-xl font-bold mb-6 text-center" style={{color: '#1C325E'}}>System Performance</h2>
              <div className="flex items-center justify-center gap-8 md:gap-16">
                {/* Performance Circle */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 128 128">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - systemPerformanceScore / 100)}`}
                        className="text-green-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl md:text-5xl font-bold" style={{color: '#1C325E'}}>
                        {systemPerformanceScore}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm md:text-base font-semibold" style={{color: '#1C325E'}}>Performance</p>
                </div>

                {/* System Health Circle */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 128 128">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - systemHealthScore / 100)}`}
                        className="text-green-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl md:text-5xl font-bold" style={{color: '#1C325E'}}>
                        {systemHealthScore}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm md:text-base font-semibold whitespace-nowrap" style={{color: '#1C325E'}}>System Health</p>
                </div>

                {/* Deficiencies Circle */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 128 128">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - deficienciesPercentage / 100)}`}
                        className="text-orange-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl md:text-5xl font-bold" style={{color: '#1C325E'}}>
                        {deficienciesPercentage}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm md:text-base font-semibold" style={{color: '#1C325E'}}>Deficiencies</p>
                </div>
              </div>
            </div>

            {/* Warnings Section */}
            {displayData?.warnings && displayData.warnings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4" style={{borderColor: '#DB7218'}} data-testid="warnings-section">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5" style={{color: '#DB7218'}} />
                  <h2 className="text-lg font-bold" style={{color: '#1C325E'}}>ATTENTION REQUIRED</h2>
                </div>
                <div className="space-y-1">
                  {displayData.warnings.map((warning, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-2 ${getSeverityColor(warning.severity)}`}
                  data-testid={`warning-${index}`}
                >
                  <p className="font-medium">{warning.message}</p>
                </div>
              ))}
                </div>
              </div>
            )}

            {/* Compact Customer & System Info */}
            <div className="bg-white rounded-lg shadow-sm mb-3 border" style={{borderColor: '#e5e7eb'}}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                {/* Customer Information - Compact */}
                <div className="border-r border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-2 text-white rounded-tl-lg" style={{backgroundColor: '#1C325E'}}>
                    <User className="w-3.5 h-3.5" />
                    <h3 className="text-xs font-semibold">Customer</h3>
                  </div>
                  <div className="p-3">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Name</span>
                        <p className="text-xs font-medium" style={{color: '#1C325E'}}>{currentData.customer_name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Email</span>
                        <p className="text-[11px] font-medium truncate" style={{color: '#1C325E'}}>{currentData.customer_email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Phone</span>
                        <p className="text-xs font-medium" style={{color: '#1C325E'}}>{currentData.customer_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indoor Unit - Compact */}
                <div className="border-r border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-2 text-white" style={{backgroundColor: '#1C325E'}}>
                    <Snowflake className="w-3.5 h-3.5" />
                    <h3 className="text-xs font-semibold">Indoor Unit</h3>
                  </div>
                  <div className="p-3">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Brand</span>
                        <p className="text-xs font-medium" style={{color: '#1C325E'}}>{currentData.evaporator_brand}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Model</span>
                        <p className="text-[11px] font-medium truncate" style={{color: '#1C325E'}}>{currentData.evaporator_model_number}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Age</span>
                        <p className="text-xs font-medium" style={{color: '#1C325E'}}>{currentData.evaporator_age || 'N/A'}</p>
                      </div>
                      <div>
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          currentData.evaporator_warranty_status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>{currentData.evaporator_warranty_status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Condenser Unit - Compact */}
                <div className="border-r border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-2 text-white" style={{backgroundColor: '#1C325E'}}>
                    <Snowflake className="w-3.5 h-3.5" />
                    <h3 className="text-xs font-semibold">Condenser Unit</h3>
                  </div>
                  <div className="p-3">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Brand</span>
                        <p className="text-xs font-medium" style={{color: '#1C325E'}}>{currentData.condenser_brand}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Model</span>
                        <p className="text-[11px] font-medium truncate" style={{color: '#1C325E'}}>{currentData.condenser_model_number}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Age</span>
                        <p className="text-xs font-medium" style={{color: '#1C325E'}}>{currentData.condenser_age || 'N/A'}</p>
                      </div>
                      <div>
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          currentData.condenser_warranty_status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>{currentData.condenser_warranty_status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Date - Compact */}
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-white rounded-tr-lg" style={{backgroundColor: '#1C325E'}}>
                    <Calendar className="w-3.5 h-3.5" />
                    <h3 className="text-xs font-semibold">Service Info</h3>
                  </div>
                  <div className="p-3">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase">Date</span>
                      <p className="text-xs font-medium" style={{color: '#1C325E'}}>{new Date(currentData.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase">Technician</span>
                      <p className="text-xs font-medium truncate" style={{color: '#1C325E'}}>{currentData.technician_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase">Version</span>
                      <p className="text-xs font-medium" style={{color: '#1C325E'}}>
                        {currentData.current_version === 1 ? 'Initial' : `Repair ${currentData.current_version - 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm mb-4 border" style={{borderColor: '#e5e7eb'}}>
          <h3 className="text-base font-bold px-4 py-3 text-white rounded-t-lg" style={{backgroundColor: '#1C325E'}}>SYSTEM PERFORMANCE METRICS</h3>
          <div className="p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            
            {/* Blower Motor Capacitor - Only show if PSC Motor */}
            {currentData.blower_motor_type === "PSC Motor" && currentData.blower_motor_capacitor_health && (
              <div 
                className="p-0 rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-white border-gray-300"
                onClick={() => openMetricInfo('capacitor', currentData.blower_motor_capacitor_health.toLowerCase())}
                data-testid="blower-capacitor-metric-card"
              >
                <h4 className="font-semibold text-sm px-3 py-2 text-white flex items-center gap-2 rounded-t-lg" style={{backgroundColor: '#1C325E'}}>
                  <Plug2 className="w-4 h-4" />
                  <span className="text-xs">Blower Motor Capacitor</span>
                </h4>
                <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentData.blower_motor_capacitor_health)}
                    <span className="text-xs font-semibold">{currentData.blower_motor_capacitor_health}</span>
                  </div>
                  {currentData.capacitor_photos && currentData.capacitor_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.capacitor_photos, 'Capacitor Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.capacitor_photos.length} photo(s) available`}
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Rating:</span>
                    <span className="font-medium">{currentData.blower_motor_capacitor_rating}µF</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Reading:</span>
                    <span className="font-medium">{currentData.blower_motor_capacitor_reading}µF</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Variance:</span>
                    <span className="font-medium">{currentData.blower_motor_capacitor_tolerance?.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
                </div>
              </div>
            )}

            {/* Condenser Fan Motor */}
            <div 
              className={`p-3 rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                currentData.condenser_fan_motor === 'Inoperative' 
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : currentData.condenser_fan_motor === 'Motor Vibration' || currentData.condenser_fan_motor === 'Blade Vibration'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('condenser_fan_motor', 
                currentData.condenser_fan_motor === 'Inoperative' ? 'critical' :
                currentData.condenser_fan_motor === 'Motor Vibration' || currentData.condenser_fan_motor === 'Blade Vibration' ? 'warning' : 'good'
              )}
              data-testid="condenser-fan-motor-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Fan className="w-4 h-4 opacity-70" />
                  <span>Condenser Fan Motor</span>
                </div>
                <Info className="w-3 h-3 opacity-60" />
              </h4>
              <p className="text-xs font-medium">{currentData.condenser_fan_motor}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Condenser Dual Run Capacitor */}
            <div 
              className={`p-3 rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getSeverityColor(currentData.condenser_capacitor_health.toLowerCase())}`}
              onClick={() => openMetricInfo('capacitor', currentData.condenser_capacitor_health.toLowerCase())}
              data-testid="condenser-capacitor-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 opacity-70" />
                  <span>Condenser Dual Run Capacitor</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    currentData.condenser_capacitor_health === 'Good' ? 'bg-green-200' :
                    currentData.condenser_capacitor_health === 'Warning' ? 'bg-orange-200' : 'bg-red-200'
                  }`}>{currentData.condenser_capacitor_health}</span>
                  {currentData.capacitor_photos && currentData.capacitor_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.capacitor_photos, 'Capacitor Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.capacitor_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <div className="space-y-3">
                {/* Herm Terminal */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">Common to Herm Terminal</div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Rating:</span>
                    <span className="font-medium">{currentData.condenser_capacitor_herm_rating}µF</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Reading:</span>
                    <span className="font-medium">{currentData.condenser_capacitor_herm_reading}µF</span>
                  </div>
                </div>
                {/* Fan Terminal */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">Common to Fan Terminal</div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Rating:</span>
                    <span className="font-medium">{currentData.condenser_capacitor_fan_rating}µF</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Reading:</span>
                    <span className="font-medium">{currentData.condenser_capacitor_fan_reading}µF</span>
                  </div>
                </div>
                {/* Overall Variance */}
                <div className="flex justify-between text-xs">
                  <span className="opacity-80">Max Variance:</span>
                  <span className="font-medium">{currentData.condenser_capacitor_tolerance.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Delta T */}
            <div 
              className={`p-3 rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getSeverityColor(currentData.delta_t_status.toLowerCase())}`}
              onClick={() => openMetricInfo('temperature', currentData.delta_t_status.toLowerCase())}
              data-testid="temperature-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 opacity-70" />
                  <span>Temperature</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    currentData.delta_t_status === 'Good' ? 'bg-green-200' :
                    currentData.delta_t_status === 'Warning' ? 'bg-orange-200' : 'bg-red-200'
                  }`}>{currentData.delta_t_status}</span>
                  {currentData.temperature_photos && currentData.temperature_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.temperature_photos, 'Temperature Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.temperature_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="opacity-80">Return Air:</span>
                  <span className="font-medium">{currentData.return_temp}°F</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-80">Supply Air:</span>
                  <span className="font-medium">{currentData.supply_temp}°F</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-80">Delta T:</span>
                  <span className="font-medium">{currentData.delta_t.toFixed(1)}°F</span>
                </div>
              </div>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Primary Drain */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                currentData.primary_drain === 'Clogged, needs immediate service' 
                  ? 'bg-red-100 border-red-300 text-red-800' 
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('drain', currentData.primary_drain === 'Clogged, needs immediate service' ? 'critical' : 'good')}
              data-testid="drain-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 opacity-70" />
                  <span>Primary Drain</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  {currentData.drainage_photos && currentData.drainage_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.drainage_photos, 'Drainage Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.drainage_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <p className="text-xs font-medium">{currentData.primary_drain}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Drain Pan Condition */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                currentData.drain_pan_condition === 'Rusted and should be replaced' || currentData.drain_pan_condition === 'Poor condition (Replace Soon)'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : currentData.drain_pan_condition === 'Fair condition'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('drain_pan', 
                currentData.drain_pan_condition === 'Rusted and should be replaced' || currentData.drain_pan_condition === 'Poor condition (Replace Soon)' ? 'critical' :
                currentData.drain_pan_condition === 'Fair condition' ? 'warning' : 'good'
              )}
              data-testid="drain-pan-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Container className="w-4 h-4 opacity-70" />
                  <span>Drain Pan</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  {currentData.drainage_photos && currentData.drainage_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.drainage_photos, 'Drainage Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.drainage_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <p className="text-xs font-medium">{currentData.drain_pan_condition}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Maintenance section removed */}

            {/* Air Purifier */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                currentData.air_purifier === 'Air purifier needs replacement'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : currentData.air_purifier === 'UV light needs replacement'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : currentData.air_purifier === 'None present'
                  ? 'bg-gray-100 border-gray-300 text-gray-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('air_purifier',
                currentData.air_purifier === 'Air purifier needs replacement' ? 'critical' :
                currentData.air_purifier === 'UV light needs replacement' ? 'warning' :
                currentData.air_purifier === 'None present' ? 'none' : 'good'
              )}
              data-testid="air-purifier-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <AirFlow className="w-4 h-4 opacity-70" />
                  <span>Air Purifier</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  {currentData.indoor_air_quality_photos && currentData.indoor_air_quality_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.indoor_air_quality_photos, 'Indoor Air Quality Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.indoor_air_quality_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <p className="text-xs font-medium">{currentData.air_purifier}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Refrigerant */}
            <div 
              className={`p-3 rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getSeverityColor(currentData.refrigerant_status.toLowerCase())}`}
              onClick={() => openMetricInfo('refrigerant', currentData.refrigerant_status.toLowerCase())}
              data-testid="refrigerant-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Refrigerator className="w-4 h-4 opacity-70" />
                  <span>Refrigerant</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    currentData.refrigerant_status === 'Good' ? 'bg-green-200' :
                    currentData.refrigerant_status === 'Low' ? 'bg-orange-200' : 'bg-red-200'
                  }`}>{currentData.refrigerant_status}</span>
                  {currentData.refrigerant_photos && currentData.refrigerant_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.refrigerant_photos, 'Refrigerant Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.refrigerant_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="opacity-80">Type:</span>
                  <span className="font-medium">{currentData.refrigerant_type}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-80">Superheat:</span>
                  <span className="font-medium">{currentData.superheat}°F</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-80">Subcooling:</span>
                  <span className="font-medium">{currentData.subcooling}°F</span>
                </div>
              </div>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Overflow / Float Switch */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                currentData.overflow_float_switch === 'Inoperative or Malfunctioning (Replace)' || currentData.overflow_float_switch === 'Overflow / Float Switch Missing'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('overflow_switch', 
                currentData.overflow_float_switch === 'Inoperative or Malfunctioning (Replace)' || currentData.overflow_float_switch === 'Overflow / Float Switch Missing' ? 'critical' : 'good'
              )}
              data-testid="overflow-switch-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Wind className="w-4 h-4 opacity-70" />
                  <span>Overflow / Float Switch</span>
                </div>
                <Info className="w-3 h-3 opacity-60" />
              </h4>
              <p className="text-xs font-medium">{currentData.overflow_float_switch}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Air Filters */}
            <div 
              className="p-0 rounded-lg border-2 shadow-sm bg-white border-gray-300"
              data-testid="air-filters-metric-card"
            >
              <h4 className="font-semibold text-sm px-3 py-2 text-white flex items-center gap-2 rounded-t-lg" style={{backgroundColor: '#1C325E'}}>
                <Filter className="w-4 h-4" />
                <span className="text-xs">Air Filters</span>
              </h4>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {currentData.air_filters === "Customer will replace the filters soon" || 
                   currentData.air_filters === "Tech will return to replace filters" ? (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <span className="text-xs font-semibold">
                    {currentData.air_filters === "Customer will replace the filters soon" || 
                     currentData.air_filters === "Tech will return to replace filters" ? 'Needs Replacement' : 'Good'}
                  </span>
                </div>
                <p className="text-xs font-medium">{currentData.air_filters}</p>
              </div>
              {currentData.filters_list && currentData.filters_list.length > 0 && (
                <div className="mt-2 space-y-1">
                  {currentData.filters_list.map((filter, index) => (
                    <p key={index} className="text-xs">• {filter.size} (Qty: {filter.quantity})</p>
                  ))}
                </div>
              )}
            </div>

            {/* Evaporator Coil */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                currentData.evaporator_coil === 'Needs deep cleaning'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('evaporator_coil', 
                currentData.evaporator_coil === 'Needs deep cleaning' ? 'warning' : 'good'
              )}
              data-testid="evaporator-coil-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Triangle className="w-4 h-4 opacity-70" />
                  <span>Evaporator Coil</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  {currentData.evaporator_photos && currentData.evaporator_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.evaporator_photos, 'Evaporator Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.evaporator_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <p className="text-xs font-medium">{currentData.evaporator_coil}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Condenser Coils */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                currentData.condenser_coils === 'Unable to clean (Hose bib not accessible within 40ft)' ||
                currentData.condenser_coils === 'Coils excessively dirty (Cabinet must be disassembled to properly clean)' ||
                currentData.condenser_coils === 'Debris and leaves clogging coils (Cabinet must be disassembled to properly clean)'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('condenser_coils', 
                currentData.condenser_coils === 'Unable to clean (Hose bib not accessible within 40ft)' ||
                currentData.condenser_coils === 'Coils excessively dirty (Cabinet must be disassembled to properly clean)' ||
                currentData.condenser_coils === 'Debris and leaves clogging coils (Cabinet must be disassembled to properly clean)'
                  ? 'warning' : 'good'
              )}
              data-testid="condenser-coils-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 opacity-70" />
                  <span>Condenser Coils</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  {currentData.condenser_photos && currentData.condenser_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.condenser_photos, 'Condenser Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.condenser_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <p className="text-xs font-medium">{currentData.condenser_coils}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Plenums */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                currentData.plenums === 'Supply or Return Leaking'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('plenums', 
                currentData.plenums === 'Supply or Return Leaking' ? 'critical' : 'good'
              )}
              data-testid="plenums-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Square className="w-4 h-4 opacity-70" />
                  <span>Plenums</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  {currentData.indoor_air_quality_photos && currentData.indoor_air_quality_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.indoor_air_quality_photos, 'Indoor Air Quality Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.indoor_air_quality_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <p className="text-xs font-medium">{currentData.plenums}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Ductwork */}
            <div 
              className={`p-5 rounded-xl border-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                currentData.ductwork === 'Significant Leaks'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : currentData.ductwork === 'Minor Leaks'
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}
              onClick={() => openMetricInfo('ductwork', 
                currentData.ductwork === 'Significant Leaks' ? 'critical' :
                currentData.ductwork === 'Minor Leaks' ? 'warning' : 'good'
              )}
              data-testid="ductwork-metric-card"
            >
              <h4 className="font-medium mb-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                  <Network className="w-4 h-4 opacity-70" />
                  <span>Ductwork</span>
                </div>
                  <div className="flex items-center gap-1.5">
                  {currentData.indoor_air_quality_photos && currentData.indoor_air_quality_photos.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPhotoModal(currentData.indoor_air_quality_photos, 'Indoor Air Quality Photos');
                      }}
                      className="hover:scale-110 transition-transform"
                      title={`${currentData.indoor_air_quality_photos.length} photo(s) available`}
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                </div>
              </h4>
              <p className="text-xs font-medium">{currentData.ductwork}</p>
              <p className="text-[10px] mt-2 opacity-70 italic">Click for info</p>
            </div>

            {/* Electrical section removed */}
            </div>
          </div>
        </div>

        {/* Technician Notes and Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6 border" style={{borderColor: '#e5e7eb'}}>
          {currentData.notes && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Technician Notes</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{currentData.notes}</p>
            </div>
          )}

          {currentData.other_repair_recommendations && (
            <div className="mt-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
              <h4 className="font-medium text-orange-900 mb-2">Other Repair Recommendations</h4>
              <p className="text-orange-800 whitespace-pre-wrap">{currentData.other_repair_recommendations}</p>
            </div>
          )}
        </div>

        {/* Recommended Parts */}
        {recommendedParts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border" style={{borderColor: '#e5e7eb'}}>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Recommended Parts</h3>
            <p className="text-blue-700 mb-6">Based on the inspection, the following parts are recommended:</p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedParts.map((part) => (
                <div key={part.id} className="border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                  <h4 className="font-medium text-blue-900 mb-2">{part.name}</h4>
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
        <div className="bg-white rounded-lg shadow-sm p-6 mt-4 text-center border" style={{borderColor: '#e5e7eb'}}>
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

      {/* Photo Viewer Modal */}
      {photoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={() => setPhotoModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold" style={{color: '#1C325E'}}>
                {photoModalTitle} ({selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''})
              </h3>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => setEnlargedPhotoIndex(index)}
                >
                  <img 
                    src={photo} 
                    alt={`${photoModalTitle} ${index + 1}`}
                    className="w-full h-64 object-cover hover:opacity-90 transition-opacity"
                  />
                  <div className="p-2 bg-gray-50 text-center text-xs text-gray-600">
                    Photo {index + 1} of {selectedPhotos.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Viewer */}
      {enlargedPhotoIndex !== null && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-95"
          onClick={() => setEnlargedPhotoIndex(null)}
        >
          <button
            onClick={() => setEnlargedPhotoIndex(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-200 transition-colors z-10"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Previous Button */}
          {enlargedPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedPhotoIndex(enlargedPhotoIndex - 1);
              }}
              className="absolute left-4 p-3 bg-white rounded-full hover:bg-gray-200 transition-colors"
              title="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Image */}
          <div className="max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhotos[enlargedPhotoIndex]} 
              alt={`${photoModalTitle} ${enlargedPhotoIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 px-4 py-2 bg-white rounded-full text-xs font-medium">
              {enlargedPhotoIndex + 1} of {selectedPhotos.length}
            </div>
          </div>
          
          {/* Next Button */}
          {enlargedPhotoIndex < selectedPhotos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedPhotoIndex(enlargedPhotoIndex + 1);
              }}
              className="absolute right-4 p-3 bg-white rounded-full hover:bg-gray-200 transition-colors"
              title="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewReport;
