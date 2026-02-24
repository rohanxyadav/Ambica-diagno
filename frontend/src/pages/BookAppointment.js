import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';
import { testsAPI, packagesAPI, appointmentsAPI, paymentsAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Card } from '../components/ui/card';
import { Calendar, Clock, IndianRupee, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedType, setSelectedType] = useState('test');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [showSlots, setShowSlots] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [paymentMode, setPaymentMode] = useState('online');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const testId = searchParams.get('test');
    const packageId = searchParams.get('package');
    if (testId) {
      setSelectedType('test');
    } else if (packageId) {
      setSelectedType('package');
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      checkTimeAndFetchSlots();
    }
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [testsRes, packagesRes] = await Promise.all([
        testsAPI.getAll(),
        packagesAPI.getAll(),
      ]);
      setTests(testsRes.data);
      setPackages(packagesRes.data);

      const testId = searchParams.get('test');
      const packageId = searchParams.get('package');
      if (testId) {
        const test = testsRes.data.find(t => t.id === testId);
        if (test) setSelectedItem(test);
      } else if (packageId) {
        const pkg = packagesRes.data.find(p => p.id === packageId);
        if (pkg) setSelectedItem(pkg);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const checkTimeAndFetchSlots = async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    const cutoffTime = 8 * 60 + 30;

    const selectedDateTime = new Date(selectedDate);
    const isToday = selectedDateTime.toDateString() === now.toDateString();

    if (isToday && currentTime >= cutoffTime) {
      setShowSlots(false);
      setSelectedSlot('');
    } else {
      setShowSlots(true);
      try {
        const response = await appointmentsAPI.getSlots(selectedDate);
        setAvailableSlots(response.data.slots || []);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
      }
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }

    if (!selectedItem || !selectedDate || !formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        user_id: user.id,
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
        test_type: selectedType,
        test_id: selectedItem.id,
        test_name: selectedItem.name,
        date: selectedDate,
        time_slot: selectedSlot || null,
        payment_mode: paymentMode,
        payment_status: paymentMode === 'online' ? 'pending' : 'pay_at_center',
        amount: selectedItem.price,
        status: 'pending',
      };

      const response = await appointmentsAPI.create(appointmentData);
      const appointment = response.data.appointment;

      if (paymentMode === 'online') {
        const orderResponse = await paymentsAPI.createOrder({
          amount: selectedItem.price,
          appointment_id: appointment.id,
        });

        const options = {
          key: orderResponse.data.key_id,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          order_id: orderResponse.data.order_id,
          name: 'Ambica Diagnostic Center',
          description: selectedItem.name,
          handler: async function (response) {
            try {
              await paymentsAPI.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('Appointment booked successfully!');
              navigate('/dashboard');
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#023E8A',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        toast.success(`Appointment booked! Booking ID: ${appointment.booking_id}`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.detail || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className=\"min-h-screen bg-neutral-background\">
      <Header />

      <div className=\"pt-24 pb-16\">
        <div className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"text-center mb-12\">
            <h1 className=\"text-4xl md:text-5xl font-heading font-bold text-foreground mb-4\" data-testid=\"booking-page-title\">
              Book Appointment
            </h1>
            <p className=\"text-base md:text-lg text-slate-600\">
              Schedule your diagnostic test in simple steps
            </p>
          </div>

          <Card className=\"p-8\">
            <div className=\"space-y-8\">
              <div>
                <Label className=\"text-lg font-semibold mb-4 block\">Select Service Type</Label>
                <RadioGroup value={selectedType} onValueChange={setSelectedType} className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <RadioGroupItem value=\"test\" id=\"test\" className=\"peer sr-only\" data-testid=\"service-type-test\" />
                    <Label
                      htmlFor=\"test\"
                      className=\"flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer\"
                    >
                      <span className=\"text-lg font-semibold\">Individual Test</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value=\"package\" id=\"package\" className=\"peer sr-only\" data-testid=\"service-type-package\" />
                    <Label
                      htmlFor=\"package\"
                      className=\"flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer\"
                    >
                      <span className=\"text-lg font-semibold\">Health Package</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className=\"text-lg font-semibold mb-4 block\">
                  Select {selectedType === 'test' ? 'Test' : 'Package'}
                </Label>
                <div className=\"grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto\">
                  {(selectedType === 'test' ? tests : packages).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedItem?.id === item.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary/50'
                      }`}
                      data-testid={`select-item-${item.id}`}
                    >
                      <h3 className=\"font-semibold text-foreground mb-1\">{item.name}</h3>
                      <p className=\"text-sm text-slate-600 mb-2\">{item.description}</p>
                      <div className=\"flex items-center text-primary font-bold\">
                        <IndianRupee className=\"w-4 h-4\" />
                        <span>{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor=\"date\" className=\"text-lg font-semibold mb-4 block\">
                  Select Date
                </Label>
                <div className=\"flex items-center gap-2\">
                  <Calendar className=\"w-5 h-5 text-primary\" />
                  <Input
                    id=\"date\"
                    type=\"date\"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getTomorrowDate()}
                    className=\"flex-1\"
                    data-testid=\"booking-date-input\"
                  />
                </div>
              </div>

              {selectedDate && (
                <div>
                  <Label className=\"text-lg font-semibold mb-4 block\">Select Time Slot</Label>
                  {showSlots ? (
                    <div className=\"grid grid-cols-4 gap-2\">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedSlot === slot.time ? 'default' : 'outline'}
                          onClick={() => setSelectedSlot(slot.time)}
                          disabled={!slot.available}
                          className={`${
                            selectedSlot === slot.time ? 'bg-primary text-white' : ''
                          } ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                          data-testid={`time-slot-${slot.time}`}
                        >
                          <Clock className=\"w-4 h-4 mr-1\" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3\" data-testid=\"no-slots-message\">
                      <AlertCircle className=\"w-5 h-5 text-blue-600 mt-0.5\" />
                      <div>
                        <p className=\"text-blue-900 font-semibold\">Booking after 8:30 AM</p>
                        <p className=\"text-blue-700 text-sm\">
                          Our team will contact you to confirm your appointment time.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className=\"space-y-4\">
                <Label className=\"text-lg font-semibold block\">Your Details</Label>
                <div>
                  <Label htmlFor=\"name\">Name</Label>
                  <Input
                    id=\"name\"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid=\"booking-name-input\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"email\">Email</Label>
                  <Input
                    id=\"email\"
                    type=\"email\"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid=\"booking-email-input\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"phone\">Phone</Label>
                  <Input
                    id=\"phone\"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    data-testid=\"booking-phone-input\"
                  />
                </div>
              </div>

              <div>
                <Label className=\"text-lg font-semibold mb-4 block\">Payment Mode</Label>
                <RadioGroup value={paymentMode} onValueChange={setPaymentMode} className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <RadioGroupItem value=\"online\" id=\"online\" className=\"peer sr-only\" data-testid=\"payment-mode-online\" />
                    <Label
                      htmlFor=\"online\"
                      className=\"flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer\"
                    >
                      <span className=\"font-semibold\">Pay Online</span>
                      <span className=\"text-sm text-slate-600\">UPI, Cards, Net Banking</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value=\"at_center\" id=\"at_center\" className=\"peer sr-only\" data-testid=\"payment-mode-center\" />
                    <Label
                      htmlFor=\"at_center\"
                      className=\"flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer\"
                    >
                      <span className=\"font-semibold\">Pay at Center</span>
                      <span className=\"text-sm text-slate-600\">Cash or Card</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {selectedItem && (
                <div className=\"bg-slate-50 rounded-lg p-6 border border-slate-200\">
                  <h3 className=\"font-semibold text-lg mb-4\">Booking Summary</h3>
                  <div className=\"space-y-2\">
                    <div className=\"flex justify-between\">
                      <span className=\"text-slate-600\">Service:</span>
                      <span className=\"font-semibold\">{selectedItem.name}</span>
                    </div>
                    <div className=\"flex justify-between\">
                      <span className=\"text-slate-600\">Date:</span>
                      <span className=\"font-semibold\">{selectedDate || 'Not selected'}</span>
                    </div>
                    {showSlots && selectedSlot && (
                      <div className=\"flex justify-between\">
                        <span className=\"text-slate-600\">Time:</span>
                        <span className=\"font-semibold\">{selectedSlot}</span>
                      </div>
                    )}
                    <div className=\"flex justify-between text-lg pt-4 border-t\">
                      <span className=\"font-semibold\">Total Amount:</span>
                      <div className=\"flex items-center font-bold text-primary\">
                        <IndianRupee className=\"w-5 h-5\" />
                        <span>{selectedItem.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBooking}
                disabled={loading || !selectedItem || !selectedDate}
                className=\"w-full bg-primary hover:bg-primary-hover text-white text-lg py-6\"
                data-testid=\"confirm-booking-button\"
              >
                {loading ? 'Processing...' : `Confirm Booking`}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookAppointment;
