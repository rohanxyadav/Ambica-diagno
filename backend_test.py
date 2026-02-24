#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class AmbicaDiagnosticTester:
    def __init__(self, base_url="https://ambica-wellness.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.patient_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_appointment_id = None

    def log_test(self, test_name, passed, message=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ PASS: {test_name} {message}")
        else:
            print(f"❌ FAIL: {test_name} {message}")
        return passed

    def run_api_test(self, name, method, endpoint, expected_status, data=None, headers=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        
        if token:
            request_headers['Authorization'] = f'Bearer {token}'
        if headers:
            request_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=30)

            success = response.status_code == expected_status
            result_data = {}
            
            if response.headers.get('Content-Type', '').startswith('application/json'):
                try:
                    result_data = response.json()
                except:
                    pass

            return self.log_test(
                name, 
                success, 
                f"- Status: {response.status_code} (expected {expected_status})"
            ), result_data

        except requests.exceptions.RequestException as e:
            return self.log_test(name, False, f"- Network Error: {str(e)}"), {}
        except Exception as e:
            return self.log_test(name, False, f"- Error: {str(e)}"), {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_api_test("API Root", "GET", "/api/", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_api_test(
            "Admin Login",
            "POST", 
            "/api/auth/login",
            200,
            data={"email": "admin@ambica.com", "password": "admin123"}
        )
        if success and "token" in response:
            self.admin_token = response["token"]
        return success, response

    def test_patient_login(self):
        """Test patient login"""  
        success, response = self.run_api_test(
            "Patient Login",
            "POST",
            "/api/auth/login", 
            200,
            data={"email": "patient@ambica.com", "password": "patient123"}
        )
        if success and "token" in response:
            self.patient_token = response["token"]
        return success, response

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        return self.run_api_test(
            "Unauthorized Access (No Token)", 
            "GET", 
            "/api/auth/me", 
            401
        )

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not self.admin_token:
            return self.log_test("Admin Stats", False, "- No admin token available"), {}
        return self.run_api_test(
            "Admin Stats", 
            "GET", 
            "/api/admin/stats", 
            200, 
            token=self.admin_token
        )

    def test_seed_data(self):
        """Test seeding sample data"""
        if not self.admin_token:
            return self.log_test("Seed Data", False, "- No admin token available"), {}
        return self.run_api_test(
            "Seed Sample Data",
            "POST",
            "/api/admin/seed-data",
            200,
            token=self.admin_token
        )

    def test_get_tests(self):
        """Test getting all tests"""
        return self.run_api_test("Get Tests", "GET", "/api/tests", 200)

    def test_get_packages(self):
        """Test getting all packages"""
        return self.run_api_test("Get Packages", "GET", "/api/packages", 200)

    def test_get_memberships(self):
        """Test getting all memberships"""
        return self.run_api_test("Get Memberships", "GET", "/api/memberships", 200)

    def test_get_appointment_slots(self):
        """Test getting appointment slots"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        return self.run_api_test(
            "Get Appointment Slots", 
            "GET", 
            f"/api/appointments/slots?date={tomorrow}", 
            200
        )

    def test_create_appointment(self):
        """Test creating an appointment"""
        if not self.patient_token:
            return self.log_test("Create Appointment", False, "- No patient token available"), {}
        
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        appointment_data = {
            "user_name": "Test Patient",
            "user_email": "patient@ambica.com", 
            "user_phone": "+91 9876543210",
            "test_type": "test",
            "test_id": "test-123",
            "test_name": "Test CBC",
            "date": tomorrow,
            "time_slot": "06:00",
            "payment_mode": "at_center",
            "amount": 350.0
        }
        
        success, response = self.run_api_test(
            "Create Appointment",
            "POST",
            "/api/appointments", 
            200,
            data=appointment_data,
            token=self.patient_token
        )
        
        if success and response.get("appointment", {}).get("id"):
            self.created_appointment_id = response["appointment"]["id"]
            
        return success, response

    def test_get_user_appointments(self):
        """Test getting user's appointments"""
        if not self.patient_token:
            return self.log_test("Get User Appointments", False, "- No patient token available"), {}
        return self.run_api_test(
            "Get User Appointments",
            "GET", 
            "/api/appointments",
            200,
            token=self.patient_token
        )

    def test_admin_get_all_appointments(self):
        """Test admin getting all appointments"""
        if not self.admin_token:
            return self.log_test("Admin Get All Appointments", False, "- No admin token available"), {}
        return self.run_api_test(
            "Admin Get All Appointments",
            "GET",
            "/api/appointments/all", 
            200,
            token=self.admin_token
        )

    def test_update_appointment_status(self):
        """Test updating appointment status (admin)"""
        if not self.admin_token or not self.created_appointment_id:
            return self.log_test("Update Appointment Status", False, "- Missing admin token or appointment ID"), {}
        return self.run_api_test(
            "Update Appointment Status",
            "PUT",
            f"/api/appointments/{self.created_appointment_id}",
            200,
            data={"status": "confirmed"}, 
            token=self.admin_token
        )

    def test_payment_order_creation(self):
        """Test creating payment order"""
        if not self.patient_token:
            return self.log_test("Create Payment Order", False, "- No patient token available"), {}
        
        payment_data = {
            "amount": 350.0,
            "appointment_id": self.created_appointment_id or "test-appointment"
        }
        
        return self.run_api_test(
            "Create Payment Order",
            "POST",
            "/api/payments/create-order",
            200,
            data=payment_data,
            token=self.patient_token
        )

    def test_admin_users(self):
        """Test admin getting all users"""
        if not self.admin_token:
            return self.log_test("Admin Get Users", False, "- No admin token available"), {}
        return self.run_api_test(
            "Admin Get Users",
            "GET",
            "/api/admin/users", 
            200,
            token=self.admin_token
        )

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        return self.run_api_test(
            "Invalid Login",
            "POST",
            "/api/auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpassword"}
        )

    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting Ambica Diagnostic Backend API Tests")
        print("=" * 60)
        
        # Basic API tests
        self.test_api_root()
        
        # Authentication tests
        print("\n📋 Authentication Tests:")
        self.test_admin_login()
        self.test_patient_login()
        self.test_invalid_login()
        self.test_unauthorized_access()
        
        # Data seeding (admin required)
        print("\n📊 Admin Data Management:")
        self.test_seed_data()
        self.test_admin_stats()
        self.test_admin_users()
        
        # Public data endpoints
        print("\n📦 Public Data Endpoints:")
        self.test_get_tests()
        self.test_get_packages()
        self.test_get_memberships()
        
        # Appointment flow
        print("\n📅 Appointment Management:")
        self.test_get_appointment_slots()
        self.test_create_appointment()
        self.test_get_user_appointments()
        self.test_admin_get_all_appointments()
        self.test_update_appointment_status()
        
        # Payment system
        print("\n💳 Payment System:")
        self.test_payment_order_creation()
        
        # Results summary
        print("\n" + "=" * 60)
        print(f"📊 TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Backend API is functioning well!")
            return 0
        elif success_rate >= 60:
            print("⚠️  Backend has some issues but core functionality works")
            return 1
        else:
            print("🚨 Backend has significant issues")
            return 2

def main():
    tester = AmbicaDiagnosticTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())