import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Snowflake, Plus, LogOut, FileText, Copy, ExternalLink, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { API, AuthContext } from '../App';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      navigate('/technician/login');
      return;
    }
    fetchReports();
  }, [user, token, navigate]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (uniqueLink) => {
    const link = `${window.location.origin}/report/${uniqueLink}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Report link copied to clipboard!');
    } catch (err) {
      // Clipboard permission denied - show link in toast
      toast.info(`Link: ${link}`, { duration: 10000 });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Snowflake className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Technician Dashboard</h1>
                <p className="text-blue-700">Welcome back, {user?.username}!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/technician/create-report')}
                className="text-white hover:opacity-90"
                style={{backgroundColor: '#DB7218'}}
                data-testid="create-report-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover:bg-gray-50"
                style={{borderColor: '#1C325E', color: '#1C325E'}}
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Your Reports</h2>
          
          {loading ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-blue-700">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-700 mb-4">No reports yet. Create your first report to get started!</p>
              <Button
                onClick={() => navigate('/technician/create-report')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Report
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <div key={report.id} className="glass rounded-xl p-6 card-hover" data-testid={`report-${report.id}`}>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-blue-900">{report.customer_name}</h3>
                        {report.warnings.length > 0 && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            {report.warnings.length} Warning{report.warnings.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-blue-700">
                        <p><span className="font-semibold">System:</span> {report.system_brand}</p>
                        <p><span className="font-semibold">Serial:</span> {report.serial_number}</p>
                        <p><span className="font-semibold">Email:</span> {report.customer_email}</p>
                        <p><span className="font-semibold">Date:</span> {new Date(report.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(report.unique_link)}
                        className="hover:bg-gray-50"
                        style={{borderColor: '#1C325E', color: '#1C325E'}}
                        data-testid={`copy-link-btn-${report.id}`}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                      {(report.edit_count || 0) < 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/technician/edit-report/${report.id}`)}
                          className="hover:bg-blue-50"
                          style={{borderColor: '#1C325E', color: '#1C325E'}}
                          data-testid={`edit-report-btn-${report.id}`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit {report.edit_count > 0 && `(${report.edit_count}/3)`}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => window.open(`/report/${report.unique_link}`, '_blank')}
                        className="text-white hover:opacity-90"
                        style={{backgroundColor: '#DB7218'}}
                        data-testid={`view-report-btn-${report.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
