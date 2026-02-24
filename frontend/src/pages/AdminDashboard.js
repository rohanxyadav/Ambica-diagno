import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { adminAPI, appointmentsAPI, testsAPI, packagesAPI, membershipsAPI, reportsAPI } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, IndianRupee, Users, FileText, Activity, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, appointmentsRes, testsRes, packagesRes, membershipsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        appointmentsAPI.getAll(),
        testsAPI.getAll(),
        packagesAPI.getAll(),
        membershipsAPI.getAll(),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data);
      setAppointments(appointmentsRes.data);
      setTests(testsRes.data);
      setPackages(packagesRes.data);
      setMemberships(membershipsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      await adminAPI.seedData();
      toast.success('Sample data seeded successfully!');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to seed data');
    }
  };

  const handleUpdateAppointment = async (id, status) => {
    try {
      await appointmentsAPI.update(id, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update appointment');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-background\">
      <Header />

      <div className="pt-24 pb-16\">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className="flex justify-between items-center mb-8\">
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2\" data-testid=\"admin-dashboard-title\">
                Admin Dashboard
              </h1>
              <p className="text-slate-600\">Manage your diagnostic center</p>
            </div>
            <Button onClick={handleSeedData} variant=\"outline\" data-testid=\"seed-data-button\">
              Seed Sample Data
            </Button>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8\">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl\">
              <TabsTrigger value=\"overview\" data-testid=\"tab-overview\">Overview</TabsTrigger>
              <TabsTrigger value=\"appointments\" data-testid=\"tab-appointments\">Appointments</TabsTrigger>
              <TabsTrigger value=\"tests\" data-testid=\"tab-tests\">Tests</TabsTrigger>
              <TabsTrigger value=\"packages\" data-testid=\"tab-packages\">Packages</TabsTrigger>
              <TabsTrigger value=\"users\" data-testid=\"tab-users\">Users</TabsTrigger>
            </TabsList>

            <TabsContent value=\"overview\" className="space-y-8\">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6\">
                <Card className="p-6\">
                  <div className="flex items-center justify-between\">
                    <div>
                      <p className="text-sm text-slate-600 mb-1\">Total Bookings</p>
                      <p className="text-3xl font-bold text-primary\">{stats?.total_bookings || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center\">
                      <Calendar className="w-6 h-6 text-primary\" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6\">
                  <div className="flex items-center justify-between\">
                    <div>
                      <p className="text-sm text-slate-600 mb-1\">Pending Appointments</p>
                      <p className="text-3xl font-bold text-yellow-600\">{stats?.pending_appointments || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center\">
                      <Activity className="w-6 h-6 text-yellow-600\" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6\">
                  <div className="flex items-center justify-between\">
                    <div>
                      <p className="text-sm text-slate-600 mb-1\">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600 flex items-center\">
                        <IndianRupee className="w-6 h-6\" />
                        {stats?.total_revenue || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center\">
                      <IndianRupee className="w-6 h-6 text-green-600\" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6\">
                  <div className="flex items-center justify-between\">
                    <div>
                      <p className="text-sm text-slate-600 mb-1\">Pending Reports</p>
                      <p className="text-3xl font-bold text-red-600\">{stats?.pending_reports || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center\">
                      <FileText className="w-6 h-6 text-red-600\" />
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-6\">
                  Recent Appointments
                </h2>
                <Card className="p-6\">
                  <div className="overflow-x-auto\">
                    <table className="w-full\">
                      <thead>
                        <tr className="border-b\">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Booking ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Patient</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Test</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.slice(0, 10).map((appointment) => (
                          <tr key={appointment.id} className="border-b last:border-0\">
                            <td className="py-3 px-4 text-sm font-medium\">{appointment.booking_id}</td>
                            <td className="py-3 px-4 text-sm\">{appointment.user_name}</td>
                            <td className="py-3 px-4 text-sm\">{appointment.test_name}</td>
                            <td className="py-3 px-4 text-sm\">{appointment.date}</td>
                            <td className="py-3 px-4 text-sm font-semibold flex items-center\">
                              <IndianRupee className="w-4 h-4\" />
                              {appointment.amount}
                            </td>
                            <td className="py-3 px-4\">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value=\"appointments\" className="space-y-6\">
              <div className="flex justify-between items-center mb-6\">
                <h2 className="text-2xl font-heading font-semibold text-foreground\">
                  All Appointments ({appointments.length})
                </h2>
              </div>

              <div className="grid gap-4\">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="p-6\" data-testid={`admin-appointment-${appointment.id}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4\">
                      <div className="flex-1\">
                        <div className="flex items-center gap-3 mb-2\">
                          <h3 className="text-lg font-semibold text-foreground\">
                            {appointment.booking_id}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.payment_status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                          }`}>
                            {appointment.payment_status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600\">
                          <p><span className="font-semibold\">Patient:</span> {appointment.user_name}</p>
                          <p><span className="font-semibold\">Test:</span> {appointment.test_name}</p>
                          <p><span className="font-semibold\">Date:</span> {appointment.date}</p>
                          <p><span className="font-semibold\">Time:</span> {appointment.time_slot || 'TBD'}</p>
                          <p><span className="font-semibold\">Phone:</span> {appointment.user_phone}</p>
                          <p className="flex items-center\"><span className="font-semibold\">Amount:</span> <IndianRupee className="w-4 h-4 ml-1\" />{appointment.amount}</p>
                        </div>
                      </div>
                      <div className="flex gap-2\">
                        {appointment.status === 'pending' && (
                          <>
                            <Button
                              size=\"sm\"
                              onClick={() => handleUpdateAppointment(appointment.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700 text-white\"
                              data-testid={`approve-appointment-${appointment.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1\" />
                              Approve
                            </Button>
                            <Button
                              size=\"sm\"
                              variant=\"destructive\"
                              onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}
                              data-testid={`cancel-appointment-${appointment.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1\" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            size=\"sm\"
                            onClick={() => handleUpdateAppointment(appointment.id, 'completed')}
                            className="bg-primary hover:bg-primary-hover text-white\"
                            data-testid={`complete-appointment-${appointment.id}`}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value=\"tests\" className="space-y-6\">
              <h2 className="text-2xl font-heading font-semibold text-foreground\">
                Tests Management ({tests.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6\">
                {tests.map((test) => (
                  <Card key={test.id} className="p-6\" data-testid={`admin-test-${test.id}`}>
                    <div className="mb-2\">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary\">
                        {test.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2\">{test.name}</h3>
                    <p className="text-sm text-slate-600 mb-4\">{test.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t\">
                      <div className="flex items-center font-bold text-primary\">
                        <IndianRupee className="w-5 h-5\" />
                        <span className="text-xl\">{test.price}</span>
                      </div>
                      <Button size=\"sm\" variant=\"outline\">Edit</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value=\"packages\" className="space-y-6\">
              <h2 className="text-2xl font-heading font-semibold text-foreground\">
                Packages Management ({packages.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6\">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="p-6\" data-testid={`admin-package-${pkg.id}`}>
                    <h3 className="text-lg font-semibold text-foreground mb-2\">{pkg.name}</h3>
                    <p className="text-sm text-slate-600 mb-4\">{pkg.description}</p>
                    <p className="text-sm text-slate-600 mb-4\">
                      <span className="font-semibold\">Included Tests:</span> {pkg.included_tests.length}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t\">
                      <div className="flex items-center font-bold text-primary\">
                        <IndianRupee className="w-5 h-5\" />
                        <span className="text-xl\">{pkg.price}</span>
                      </div>
                      <Button size=\"sm\" variant=\"outline\">Edit</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value=\"users\" className="space-y-6\">
              <h2 className="text-2xl font-heading font-semibold text-foreground\">
                Users Management ({users.length})
              </h2>
              <Card className="p-6\">
                <div className="overflow-x-auto\">
                  <table className="w-full\">
                    <thead>
                      <tr className="border-b\">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Phone</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700\">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b last:border-0\" data-testid={`admin-user-${user.id}`}>
                          <td className="py-3 px-4 text-sm font-medium\">{user.name}</td>
                          <td className="py-3 px-4 text-sm\">{user.email}</td>
                          <td className="py-3 px-4 text-sm\">{user.phone}</td>
                          <td className="py-3 px-4\">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600\">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
