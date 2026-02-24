import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, paymentsAPI, reportsAPI } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, FileText, IndianRupee, Download, Clock, CheckCircle, XCircle } from 'lucide-react';

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
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== 'completed' && apt.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-neutral-background\">
      <Header />

      <div className="pt-24 pb-16\">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className="mb-8\">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2\" data-testid=\"dashboard-title\">
              Welcome, {user?.name}!
            </h1>
            <p className="text-slate-600\">Manage your appointments and reports</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12\">
            <Card className="p-6\">
              <div className="flex items-center justify-between\">
                <div>
                  <p className="text-sm text-slate-600 mb-1\">Total Appointments</p>
                  <p className="text-3xl font-bold text-primary\">{appointments.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center\">
                  <Calendar className="w-6 h-6 text-primary\" />
                </div>
              </div>
            </Card>

            <Card className="p-6\">
              <div className="flex items-center justify-between\">
                <div>
                  <p className="text-sm text-slate-600 mb-1\">Available Reports</p>
                  <p className="text-3xl font-bold text-primary\">{reports.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center\">
                  <FileText className="w-6 h-6 text-primary\" />
                </div>
              </div>
            </Card>

            <Card className="p-6\">
              <div className="flex items-center justify-between\">
                <div>
                  <p className="text-sm text-slate-600 mb-1\">Total Spent</p>
                  <p className="text-3xl font-bold text-primary flex items-center\">
                    <IndianRupee className="w-6 h-6\" />
                    {payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center\">
                  <IndianRupee className="w-6 h-6 text-primary\" />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8\">
            <div>
              <div className="flex justify-between items-center mb-6\">
                <h2 className="text-2xl font-heading font-semibold text-foreground\">
                  Upcoming Appointments
                </h2>
                <Link to=\"/book-appointment\" data-testid=\"book-new-appointment\">
                  <Button className="bg-primary hover:bg-primary-hover text-white\">
                    Book New Appointment
                  </Button>
                </Link>
              </div>

              {upcomingAppointments.length === 0 ? (
                <Card className="p-8 text-center\">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4\" />
                  <p className="text-slate-600 mb-4\">No upcoming appointments</p>
                  <Link to=\"/book-appointment\">
                    <Button className="bg-primary hover:bg-primary-hover text-white\">
                      Book Your First Appointment
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid gap-4\">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="p-6\" data-testid={`appointment-card-${appointment.id}`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4\">
                        <div className="flex-1\">
                          <div className="flex items-center gap-3 mb-2\">
                            <h3 className="text-xl font-semibold text-foreground\">
                              {appointment.test_name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600\">
                            <div className="flex items-center gap-1\">
                              <Calendar className="w-4 h-4\" />
                              <span>{appointment.date}</span>
                            </div>
                            {appointment.time_slot && (
                              <div className="flex items-center gap-1\">
                                <Clock className="w-4 h-4\" />
                                <span>{appointment.time_slot}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1\">
                              <span className="font-semibold\">Booking ID:</span>
                              <span>{appointment.booking_id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4\">
                          <div className="text-right\">
                            <p className="text-sm text-slate-600\">Amount</p>
                            <p className="text-xl font-bold text-primary flex items-center\">
                              <IndianRupee className="w-5 h-5\" />
                              {appointment.amount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-6\">
                Test Reports
              </h2>

              {reports.length === 0 ? (
                <Card className="p-8 text-center\">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4\" />
                  <p className="text-slate-600\">No reports available yet</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4\">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-6\" data-testid={`report-card-${report.id}`}>
                      <div className="flex items-start justify-between\">
                        <div className="flex-1\">
                          <h3 className="text-lg font-semibold text-foreground mb-2\">
                            {report.test_name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-4\">
                            Report Date: {new Date(report.report_date).toLocaleDateString()}
                          </p>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600\">
                            <CheckCircle className="w-3 h-3\" />
                            {report.status}
                          </span>
                        </div>
                        <Button
                          variant=\"outline\"
                          size=\"sm\"
                          className="flex items-center gap-2\"
                          data-testid={`download-report-${report.id}`}
                        >
                          <Download className="w-4 h-4\" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-6\">
                Payment History
              </h2>

              {payments.length === 0 ? (
                <Card className="p-8 text-center\">
                  <IndianRupee className="w-12 h-12 text-slate-300 mx-auto mb-4\" />
                  <p className="text-slate-600\">No payment history</p>
                </Card>
              ) : (
                <Card className="p-6\">
                  <div className="overflow-x-auto\">
                    <table className="w-full\">
                      <thead>
                        <tr className="border-b\">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Payment ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b last:border-0\" data-testid={`payment-row-${payment.id}`}>
                            <td className="py-3 px-4 text-sm text-slate-600\">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600\">
                              {payment.razorpay_payment_id || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold flex items-center\">
                              <IndianRupee className="w-4 h-4\" />
                              {payment.amount}
                            </td>
                            <td className="py-3 px-4\">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                payment.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
