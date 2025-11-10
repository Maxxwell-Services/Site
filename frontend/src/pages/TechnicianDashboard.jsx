import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Snowflake, Plus, LogOut, FileText, Copy, ExternalLink, Edit, Archive, ArchiveRestore, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { API, AuthContext } from '../App';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'active', 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (!user || !token) {
      navigate('/technician/login');
      return;
    }
    fetchReports();
  }, [user, token, navigate]);

  const fetchReports = async () => {
    try {
      // Always fetch all reports (both active and archived)
      const response = await axios.get(`${API}/reports?include_archived=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const toggleArchive = async (reportId, currentArchiveStatus) => {
    try {
      const response = await axios.put(
        `${API}/reports/${reportId}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      fetchReports(); // Refresh the list
    } catch (error) {
      toast.error('Failed to archive report');
    }
  };

  // Filter reports based on view filter, search, and date
  const filteredReports = reports.filter(report => {
    // Filter by view selection
    let matchesViewFilter = true;
    if (viewFilter === 'active') {
      matchesViewFilter = report.archived !== true;
    } else if (viewFilter === 'archived') {
      matchesViewFilter = report.archived === true;
    }
    // 'all' shows everything, so no filter needed
    
    const matchesSearch = !searchQuery || 
      report.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(report.created_at).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
    
    return matchesViewFilter && matchesSearch && matchesDate;
  });

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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-blue-900">Your Reports</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewFilter === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewFilter('all')}
                style={viewFilter === 'all' ? {backgroundColor: '#1C325E'} : {borderColor: '#1C325E', color: '#1C325E'}}
                className={viewFilter === 'all' ? "text-white" : ""}
              >
                All
              </Button>
              <Button
                variant={viewFilter === 'active' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewFilter('active')}
                style={viewFilter === 'active' ? {backgroundColor: '#16a34a'} : {borderColor: '#16a34a', color: '#16a34a'}}
                className={viewFilter === 'active' ? "text-white" : ""}
              >
                Active
              </Button>
              <Button
                variant={viewFilter === 'archived' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewFilter('archived')}
                style={viewFilter === 'archived' ? {backgroundColor: '#f59e0b'} : {borderColor: '#f59e0b', color: '#f59e0b'}}
                className={viewFilter === 'archived' ? "text-white" : ""}
              >
                <Archive className="w-4 h-4 mr-1" />
                Archived
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-xl p-4 mb-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  placeholder="Filter by date..."
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {(searchQuery || dateFilter) && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {filteredReports.length} of {reports.length} reports
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setDateFilter('');
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-blue-700">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-700 mb-4">
                {reports.length === 0 
                  ? "No reports yet. Create your first report to get started!" 
                  : "No reports match your search criteria."}
              </p>
              {reports.length === 0 && (
                <Button
                  onClick={() => navigate('/technician/create-report')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Report
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="glass rounded-xl p-4 hover:shadow-lg transition-shadow" data-testid={`report-${report.id}`}>
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-blue-900 truncate">{report.customer_name}</h3>
                      <span className="text-sm text-blue-600 whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
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
                      {(report.edit_count || 0) < 3 && !report.archived && (
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
                        variant="outline"
                        size="sm"
                        onClick={() => toggleArchive(report.id, report.archived)}
                        className="hover:bg-gray-50"
                        style={{borderColor: report.archived ? '#16a34a' : '#f59e0b', color: report.archived ? '#16a34a' : '#f59e0b'}}
                        data-testid={`archive-btn-${report.id}`}
                      >
                        {report.archived ? (
                          <>
                            <ArchiveRestore className="w-4 h-4 mr-2" />
                            Unarchive
                          </>
                        ) : (
                          <>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </>
                        )}
                      </Button>
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
