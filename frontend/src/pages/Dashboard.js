import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, paymentsAPI, reportsAPI } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, FileText, IndianRupee, Download, Clock, CheckCircle, AlertCircle, TrendingUp, Shield, Lock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, paymentsRes, reportsRes] = await Promise.all([
        appointmentsAPI.getMy(),
        paymentsAPI.getHistory(),
        reportsAPI.getMy(),
      ]);
      setAppointments(appointmentsRes.data);
      setPayments(paymentsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== 'completed' && apt.status !== 'cancelled'
  );

  const pendingReports = appointments.filter(
    (apt) => apt.payment_status === 'completed' && apt.status !== 'completed'
  ).length;

  const reportsReady = reports.filter(r => r.status === 'ready').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2A7DE1] mx-auto"></div>
            <p className="mt-6 text-slate-600 font-medium">Loading your dashboard...</p>
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
          {/* Welcome Section */}
          <div className="mb-8 fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-2" data-testid="dashboard-title">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-lg text-slate-600">Here's your health dashboard overview</p>
          </div>

          {/* Premium Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="summary-card stagger-item">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Appointments</p>
                  <p className="text-4xl font-bold text-[#2A7DE1]">{appointments.length}</p>
                  <p className="text-sm text-slate-500 mt-2">All time bookings</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#2A7DE1] to-[#1E5FBC] rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="summary-card stagger-item">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Pending Reports</p>
                  <p className="text-4xl font-bold text-[#F59E0B]">{pendingReports}</p>
                  <p className="text-sm text-slate-500 mt-2">Tests in progress</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="summary-card stagger-item">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Reports Ready</p>
                  <p className="text-4xl font-bold text-[#10B981]">{reportsReady}</p>
                  <p className="text-sm text-slate-500 mt-2">Available to download</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div className="fade-in-delay">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-heading font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-[#2A7DE1]" />
                  Upcoming Appointments
                </h2>
                <Link to="/book-appointment" data-testid="book-new-appointment">
                  <Button className="interactive-button bg-gradient-to-r from-[#2A7DE1] to-[#1E5FBC] hover:from-[#1E5FBC] hover:to-[#2A7DE1] text-white shadow-md">
                    Book New Appointment
                  </Button>
                </Link>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="premium-card p-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4 text-lg">No upcoming appointments</p>
                  <Link to="/book-appointment">
                    <Button className="interactive-button bg-[#2A7DE1] hover:bg-[#1E5FBC] text-white">
                      Book Your First Appointment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={appointment.id} className={`premium-card p-6 stagger-item`} style={{animationDelay: `${0.1 * index}s`}} data-testid={`appointment-card-${appointment.id}`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {appointment.test_name}
                            </h3>
                            <span className={`px-4 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#2A7DE1]" />
                              <span className="font-medium">{appointment.date}</span>
                            </div>
                            {appointment.time_slot && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#2A7DE1]" />
                                <span className="font-medium">{appointment.time_slot}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">Booking ID:</span>
                              <span className="font-mono bg-blue-50 px-2 py-1 rounded">{appointment.booking_id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-slate-600">Amount</p>
                            <p className="text-2xl font-bold text-[#2A7DE1] flex items-center">
                              <IndianRupee className="w-5 h-5" />
                              {appointment.amount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Access to Reports */}
            <div className="fade-in-delay">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-heading font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#2A7DE1]" />
                  Recent Reports
                </h2>
                <Link to="/my-reports" data-testid="view-all-reports">
                  <Button variant="outline" className="border-[#2A7DE1] text-[#2A7DE1] hover:bg-blue-50 interactive-button">
                    View All Reports
                  </Button>
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="premium-card p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">No reports available yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {reports.slice(0, 4).map((report, index) => (
                    <div key={report.id} className={`report-card p-6 stagger-item`} style={{animationDelay: `${0.1 * index}s`}} data-testid={`report-card-${report.id}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {report.test_name}
                          </h3>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                              <span className="font-semibold">Report ID:</span>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{report.report_id}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.report_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`status-badge-${report.status}`}>
                          {report.status}
                        </div>
                      </div>
                      {report.status === 'ready' && (
                        <Button
                          onClick={async () => {
                            try {
                              const response = await reportsAPI.download(report.id);
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', report.file_name);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                            } catch (error) {
                              console.error('Download failed:', error);
                            }
                          }}
                          className="w-full interactive-button pulse-button bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981] text-white flex items-center justify-center gap-2"
                          data-testid={`download-report-${report.id}`}
                        >
                          <Download className="w-4 h-4" />
                          Download Report
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Trust Section */}
          <div className="mt-16 fade-in-delay">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-[#2A7DE1]" />
                <h3 className="text-2xl font-heading font-semibold text-gray-900">
                  Your Data is Secure
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="security-badge flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#2A7DE1] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">256-bit Encryption</p>
                    <p className="text-sm text-slate-600">Bank-level security</p>
                  </div>
                </div>
                <div className="security-badge flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#2A7DE1] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Secure Cloud Storage</p>
                    <p className="text-sm text-slate-600">Protected backups</p>
                  </div>
                </div>
                <div className="security-badge flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Privacy Protected</p>
                    <p className="text-sm text-slate-600">HIPAA compliant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
