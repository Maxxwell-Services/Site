import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Snowflake, LogOut, TrendingUp, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { API, AuthContext } from '../App';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      navigate('/customer/login');
      return;
    }
    fetchReports();
  }, [user, token, navigate]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/customer/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const calculateHealthScore = (report) => {
    let score = 100;
    if (report.capacitor_health === 'Critical') score -= 30;
    else if (report.capacitor_health === 'Warning') score -= 15;
    
    if (report.delta_t_status === 'Critical') score -= 25;
    else if (report.delta_t_status === 'Warning') score -= 10;
    
    if (report.amp_status === 'Critical') score -= 20;
    else if (report.amp_status === 'Warning') score -= 10;
    
    if (report.refrigerant_status === 'Critical') score -= 25;
    else if (report.refrigerant_status === 'Low') score -= 15;
    
    return Math.max(0, score);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-cyan-100">
                <Snowflake className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Customer Dashboard</h1>
                <p className="text-blue-700">Welcome back, {user?.name}!</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="hover:bg-gray-50"
              style={{borderColor: '#DB7218', color: '#DB7218'}}
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-blue-900">Your AC System Reports</h2>
          </div>
          
          {loading ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-blue-700">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-700 mb-4">No reports in your history yet.</p>
              <p className="text-sm text-blue-600">When a technician shares a report link with you, view it and it will be added to your history.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => {
                const healthScore = calculateHealthScore(report);
                return (
                  <div key={report.id} className="glass rounded-xl p-6 card-hover" data-testid={`report-${report.id}`}>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-blue-900">{report.system_brand} System</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
                              {healthScore}%
                            </span>
                            <span className="text-sm text-blue-700">Health Score</span>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm text-blue-700">
                          <p><span className="font-semibold">Serial:</span> {report.serial_number}</p>
                          <p><span className="font-semibold">Technician:</span> {report.technician_name}</p>
                          {report.system_age && (
                            <p><span className="font-semibold">System Age:</span> {report.system_age} years</p>
                          )}
                          <p><span className="font-semibold">Service Date:</span> {new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                        {report.warnings.length > 0 && (
                          <div className="mt-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              {report.warnings.length} Issue{report.warnings.length > 1 ? 's' : ''} Found
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open(`/report/${report.unique_link}`, '_blank')}
                        className="text-white hover:opacity-90"
                        style={{backgroundColor: '#DB7218'}}
                        data-testid={`view-report-btn-${report.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Health Insights */}
        {reports.length > 0 && (
          <div className="glass rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">System Health Over Time</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                <p className="text-sm text-blue-700 mb-1">Total Inspections</p>
                <p className="text-3xl font-bold text-blue-900">{reports.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                <p className="text-sm text-blue-700 mb-1">Latest Health Score</p>
                <p className={`text-3xl font-bold ${getHealthColor(calculateHealthScore(reports[0]))}`}>
                  {calculateHealthScore(reports[0])}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50">
                <p className="text-sm text-blue-700 mb-1">Active Warnings</p>
                <p className="text-3xl font-bold text-orange-600">
                  {reports[0]?.warnings?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
