import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FileText, Download, Clock, CheckCircle, Search, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [user, navigate]);

  useEffect(() => {
    filterReports();
  }, [searchQuery, filterStatus, reports]);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getMy();
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.report_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleDownload = async (report) => {
    try {
      const response = await reportsAPI.download(report.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', report.file_name || `${report.report_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download report');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ready: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Ready to Download' },
      processing: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Processing' },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Pending' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-background">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading your reports...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="pt-24 pb-16 page-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8 fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-[#2A7DE1] to-[#1E5FBC] bg-clip-text text-transparent mb-4" data-testid="reports-page-title">
              My Test Reports
            </h1>
            <p className="text-lg text-slate-600">
              View and download all your diagnostic test reports in one place
            </p>
          </div>

          {/* Premium Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="summary-card stagger-item">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Reports</p>
                  <p className="text-4xl font-bold text-[#2A7DE1]">{reports.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#2A7DE1] to-[#1E5FBC] rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="summary-card stagger-item">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Ready to Download</p>
                  <p className="text-4xl font-bold text-[#10B981]">
                    {reports.filter(r => r.status === 'ready').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="summary-card stagger-item">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Processing</p>
                  <p className="text-4xl font-bold text-[#3B82F6]">
                    {reports.filter(r => r.status === 'processing' || r.status === 'pending').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="premium-card p-6 mb-8 fade-in-delay">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by test name, booking ID, or report ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-slate-200 focus:border-[#2A7DE1] focus:ring-[#2A7DE1] rounded-xl"
                  data-testid="reports-search-input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className={`interactive-button rounded-xl ${filterStatus === 'all' ? 'bg-[#2A7DE1] text-white' : 'border-slate-200 hover:border-[#2A7DE1]'}`}
                  data-testid="filter-all"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'ready' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('ready')}
                  className={`interactive-button rounded-xl ${filterStatus === 'ready' ? 'bg-[#10B981] text-white' : 'border-slate-200 hover:border-[#10B981]'}`}
                  data-testid="filter-ready"
                >
                  Ready
                </Button>
                <Button
                  variant={filterStatus === 'processing' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('processing')}
                  className={`interactive-button rounded-xl ${filterStatus === 'processing' ? 'bg-[#3B82F6] text-white' : 'border-slate-200 hover:border-[#3B82F6]'}`}
                  data-testid="filter-processing"
                >
                  Processing
                </Button>
              </div>
            </div>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <div className="premium-card p-16 text-center fade-in">
              <FileText className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {searchQuery || filterStatus !== 'all' ? 'No reports found' : 'No reports available yet'}
              </h3>
              <p className="text-slate-600 mb-8 text-lg">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Your test reports will appear here once they are uploaded by our team'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button
                  onClick={() => navigate('/book-appointment')}
                  className="interactive-button bg-gradient-to-r from-[#2A7DE1] to-[#1E5FBC] hover:from-[#1E5FBC] hover:to-[#2A7DE1] text-white px-8 py-3 text-lg"
                >
                  Book a Test
                </Button>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredReports.map((report, index) => (
                <div key={report.id} className={`report-card p-6 stagger-item`} style={{animationDelay: `${0.1 * index}s`}} data-testid={`report-card-${report.id}`}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {report.test_name}
                        </h3>
                        <div className={`inline-flex items-center gap-2 status-badge-${report.status}`}>
                          {report.status === 'ready' && <CheckCircle className="w-4 h-4" />}
                          {report.status === 'processing' && <Clock className="w-4 h-4" />}
                          {report.status === 'pending' && <AlertCircle className="w-4 h-4" />}
                          {report.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2A7DE1] to-[#1E5FBC] rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 shadow-lg">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Report Details */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase">Report ID</p>
                        <p className="font-mono text-sm font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded inline-block">{report.report_id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase">Booking ID</p>
                        <p className="font-mono text-sm font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded inline-block">{report.booking_id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase">Report Date</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-[#2A7DE1]" />
                          {new Date(report.report_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase">Uploaded</p>
                        <p className="text-sm text-slate-600 font-medium">
                          {new Date(report.uploaded_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Remarks */}
                    {report.remarks && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <p className="text-xs font-semibold text-[#2A7DE1] mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Doctor's Note
                        </p>
                        <p className="text-sm text-gray-900 leading-relaxed">{report.remarks}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                      {report.status === 'ready' ? (
                        <Button
                          onClick={() => handleDownload(report)}
                          className="w-full interactive-button pulse-button bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981] text-white flex items-center justify-center gap-2 py-6 text-base font-semibold shadow-lg"
                          size="lg"
                          data-testid={`download-report-${report.id}`}
                        >
                          <Download className="w-5 h-5" />
                          Download Report
                        </Button>
                      ) : (
                        <div className="text-center py-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                          <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-600">
                            Report is being {report.status}...
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            You'll be notified once it's ready
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyReports;
