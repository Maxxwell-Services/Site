import requests
import sys
from datetime import datetime
import json

class ACMaintenanceAPITester:
    def __init__(self, base_url="https://ac-status-tracker.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tech_token = None
        self.customer_token = None
        self.report_unique_link = None
        self.report_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, passed, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = {
            "test": test_name,
            "passed": passed,
            "message": message,
            "response": response_data
        }
        self.test_results.append(result)
        print(f"\n{status} - {test_name}")
        if message:
            print(f"  {message}")

    def test_technician_register(self):
        """Test technician registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        payload = {
            "username": f"tech_{timestamp}",
            "email": f"tech_{timestamp}@test.com",
            "password": "TestPass123!"
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/technician/register", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.tech_token = data['token']
                    self.log_result("Technician Registration", True, f"Registered as {payload['username']}")
                    return True
                else:
                    self.log_result("Technician Registration", False, "Missing token or user in response")
            else:
                self.log_result("Technician Registration", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Technician Registration", False, f"Error: {str(e)}")
        
        return False

    def test_technician_login(self):
        """Test technician login with existing account"""
        # First register a new account
        timestamp = datetime.now().strftime('%H%M%S%f')
        email = f"tech_login_{timestamp}@test.com"
        password = "TestPass123!"
        
        register_payload = {
            "username": f"tech_login_{timestamp}",
            "email": email,
            "password": password
        }
        
        try:
            # Register
            requests.post(f"{self.base_url}/auth/technician/register", json=register_payload)
            
            # Now login
            login_payload = {
                "email": email,
                "password": password
            }
            
            response = requests.post(f"{self.base_url}/auth/technician/login", json=login_payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data:
                    self.log_result("Technician Login", True, "Login successful")
                    return True
                else:
                    self.log_result("Technician Login", False, "Missing token in response")
            else:
                self.log_result("Technician Login", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Technician Login", False, f"Error: {str(e)}")
        
        return False

    def test_customer_register(self):
        """Test customer registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        payload = {
            "name": f"Customer {timestamp}",
            "email": f"customer_{timestamp}@test.com",
            "password": "TestPass123!"
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/customer/register", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.customer_token = data['token']
                    self.log_result("Customer Registration", True, f"Registered as {payload['name']}")
                    return True
                else:
                    self.log_result("Customer Registration", False, "Missing token or user in response")
            else:
                self.log_result("Customer Registration", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Customer Registration", False, f"Error: {str(e)}")
        
        return False

    def test_customer_login(self):
        """Test customer login"""
        timestamp = datetime.now().strftime('%H%M%S%f')
        email = f"customer_login_{timestamp}@test.com"
        password = "TestPass123!"
        
        register_payload = {
            "name": f"Customer Login {timestamp}",
            "email": email,
            "password": password
        }
        
        try:
            # Register
            requests.post(f"{self.base_url}/auth/customer/register", json=register_payload)
            
            # Now login
            login_payload = {
                "email": email,
                "password": password
            }
            
            response = requests.post(f"{self.base_url}/auth/customer/login", json=login_payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data:
                    self.log_result("Customer Login", True, "Login successful")
                    return True
                else:
                    self.log_result("Customer Login", False, "Missing token in response")
            else:
                self.log_result("Customer Login", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Customer Login", False, f"Error: {str(e)}")
        
        return False

    def test_create_report(self):
        """Test report creation with tolerance checks"""
        if not self.tech_token:
            self.log_result("Create Report", False, "No technician token available")
            return False
        
        # Test with readings that should trigger warnings
        payload = {
            "customer_name": "John Doe",
            "customer_email": "john.doe@example.com",
            "customer_phone": "555-1234",
            "system_brand": "Carrier",
            "serial_number": "2015ABC123",
            "installation_year": 2015,
            "refrigerant_type": "R-410A",
            "refrigerant_level": 120.5,
            "refrigerant_status": "Good",
            "capacitor_rating": 35.0,
            "capacitor_reading": 32.0,  # 8.6% off - should trigger warning
            "return_temp": 78.0,
            "supply_temp": 60.0,  # Delta T = 18°F - should be good
            "amp_draw": 18.5,
            "rated_amps": 20.0,
            "filters_replaced": True,
            "condenser_coils_cleaned": True,
            "notes": "Test report with capacitor warning"
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'unique_link' in data and 'report_id' in data:
                    self.report_unique_link = data['unique_link']
                    self.report_id = data['report_id']
                    self.log_result("Create Report", True, f"Report created with link: {self.report_unique_link}")
                    return True
                else:
                    self.log_result("Create Report", False, "Missing unique_link or report_id in response")
            else:
                self.log_result("Create Report", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Create Report", False, f"Error: {str(e)}")
        
        return False

    def test_view_report_public(self):
        """Test viewing report via public link (no auth required)"""
        if not self.report_unique_link:
            self.log_result("View Report (Public)", False, "No report link available")
            return False
        
        try:
            response = requests.get(f"{self.base_url}/reports/{self.report_unique_link}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify report structure
                required_fields = ['customer_name', 'system_brand', 'delta_t', 'capacitor_tolerance', 'warnings']
                missing_fields = [f for f in required_fields if f not in data]
                
                if missing_fields:
                    self.log_result("View Report (Public)", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Verify calculations
                expected_delta_t = 78.0 - 60.0  # 18°F
                actual_delta_t = data.get('delta_t', 0)
                
                if abs(actual_delta_t - expected_delta_t) > 0.1:
                    self.log_result("View Report (Public)", False, f"Delta T calculation wrong: expected {expected_delta_t}, got {actual_delta_t}")
                    return False
                
                # Verify warnings exist (capacitor should trigger warning)
                if len(data.get('warnings', [])) == 0:
                    self.log_result("View Report (Public)", False, "Expected warnings but got none")
                    return False
                
                self.log_result("View Report (Public)", True, f"Report retrieved with {len(data['warnings'])} warnings")
                return True
            else:
                self.log_result("View Report (Public)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("View Report (Public)", False, f"Error: {str(e)}")
        
        return False

    def test_tolerance_calculations(self):
        """Test tolerance calculations with specific values"""
        if not self.tech_token:
            self.log_result("Tolerance Calculations", False, "No technician token available")
            return False
        
        # Test case 1: Critical capacitor (>10% off)
        payload = {
            "customer_name": "Test Critical",
            "customer_email": "test@example.com",
            "customer_phone": "555-0000",
            "system_brand": "Test",
            "serial_number": "TEST123",
            "refrigerant_type": "R-410A",
            "refrigerant_level": 120.0,
            "refrigerant_status": "Good",
            "capacitor_rating": 35.0,
            "capacitor_reading": 30.0,  # 14.3% off - should be critical
            "return_temp": 78.0,
            "supply_temp": 68.0,  # Delta T = 10°F - should be critical
            "amp_draw": 25.0,
            "rated_amps": 20.0,  # 25% off - should be critical
            "filters_replaced": False,
            "condenser_coils_cleaned": False
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                unique_link = data.get('unique_link')
                
                # Fetch the report to check warnings
                report_response = requests.get(f"{self.base_url}/reports/{unique_link}")
                if report_response.status_code == 200:
                    report = report_response.json()
                    warnings = report.get('warnings', [])
                    
                    # Should have warnings for capacitor, delta_t, and amp_draw
                    warning_types = [w['type'] for w in warnings]
                    
                    expected_warnings = ['capacitor', 'delta_t', 'amp_draw']
                    missing_warnings = [w for w in expected_warnings if w not in warning_types]
                    
                    if missing_warnings:
                        self.log_result("Tolerance Calculations", False, f"Missing warnings: {missing_warnings}")
                        return False
                    
                    # Check severity
                    capacitor_warning = next((w for w in warnings if w['type'] == 'capacitor'), None)
                    if capacitor_warning and capacitor_warning['severity'] != 'critical':
                        self.log_result("Tolerance Calculations", False, f"Capacitor severity should be critical, got {capacitor_warning['severity']}")
                        return False
                    
                    self.log_result("Tolerance Calculations", True, f"All tolerance checks working correctly ({len(warnings)} warnings)")
                    return True
                else:
                    self.log_result("Tolerance Calculations", False, "Failed to fetch created report")
            else:
                self.log_result("Tolerance Calculations", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Tolerance Calculations", False, f"Error: {str(e)}")
        
        return False

    def test_get_technician_reports(self):
        """Test getting technician's reports list"""
        if not self.tech_token:
            self.log_result("Get Technician Reports", False, "No technician token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.get(f"{self.base_url}/reports", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Technician Reports", True, f"Retrieved {len(data)} reports")
                    return True
                else:
                    self.log_result("Get Technician Reports", False, "Response is not a list")
            else:
                self.log_result("Get Technician Reports", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Get Technician Reports", False, f"Error: {str(e)}")
        
        return False

    def test_get_customer_reports(self):
        """Test getting customer's reports list"""
        if not self.customer_token:
            self.log_result("Get Customer Reports", False, "No customer token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.customer_token}'}
            response = requests.get(f"{self.base_url}/customer/reports", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Customer Reports", True, f"Retrieved {len(data)} reports")
                    return True
                else:
                    self.log_result("Get Customer Reports", False, "Response is not a list")
            else:
                self.log_result("Get Customer Reports", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Get Customer Reports", False, f"Error: {str(e)}")
        
        return False

    def test_parts_catalog(self):
        """Test parts catalog endpoint"""
        try:
            response = requests.get(f"{self.base_url}/parts")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if parts have required fields
                    first_part = data[0]
                    required_fields = ['id', 'name', 'category', 'description', 'price']
                    missing_fields = [f for f in required_fields if f not in first_part]
                    
                    if missing_fields:
                        self.log_result("Parts Catalog", False, f"Missing fields in parts: {missing_fields}")
                        return False
                    
                    self.log_result("Parts Catalog", True, f"Retrieved {len(data)} parts")
                    return True
                else:
                    self.log_result("Parts Catalog", False, "No parts in catalog")
            else:
                self.log_result("Parts Catalog", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Parts Catalog", False, f"Error: {str(e)}")
        
        return False

    def test_system_age_calculation(self):
        """Test system age calculation from serial number"""
        if not self.tech_token:
            self.log_result("System Age Calculation", False, "No technician token available")
            return False
        
        # Test with serial number starting with year
        payload = {
            "customer_name": "Age Test",
            "customer_email": "age@test.com",
            "customer_phone": "555-0000",
            "system_brand": "Test",
            "serial_number": "2010ABC123",  # Should calculate age from 2010
            "refrigerant_type": "R-410A",
            "refrigerant_level": 120.0,
            "refrigerant_status": "Good",
            "capacitor_rating": 35.0,
            "capacitor_reading": 35.0,
            "return_temp": 78.0,
            "supply_temp": 60.0,
            "amp_draw": 20.0,
            "rated_amps": 20.0,
            "filters_replaced": True,
            "condenser_coils_cleaned": True
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                unique_link = data.get('unique_link')
                
                # Fetch the report to check system age
                report_response = requests.get(f"{self.base_url}/reports/{unique_link}")
                if report_response.status_code == 200:
                    report = report_response.json()
                    system_age = report.get('system_age')
                    
                    if system_age is not None:
                        expected_age = datetime.now().year - 2010
                        if system_age == expected_age:
                            self.log_result("System Age Calculation", True, f"Correctly calculated age: {system_age} years")
                            return True
                        else:
                            self.log_result("System Age Calculation", False, f"Expected age {expected_age}, got {system_age}")
                    else:
                        self.log_result("System Age Calculation", False, "System age not calculated")
                else:
                    self.log_result("System Age Calculation", False, "Failed to fetch created report")
            else:
                self.log_result("System Age Calculation", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("System Age Calculation", False, f"Error: {str(e)}")
        
        return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("AC MAINTENANCE REPORT API TESTING")
        print("=" * 60)
        print(f"Base URL: {self.base_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Authentication tests
        print("\n📋 AUTHENTICATION TESTS")
        self.test_technician_register()
        self.test_technician_login()
        self.test_customer_register()
        self.test_customer_login()
        
        # Report tests
        print("\n📋 REPORT TESTS")
        self.test_create_report()
        self.test_view_report_public()
        self.test_tolerance_calculations()
        self.test_system_age_calculation()
        
        # List tests
        print("\n📋 LIST TESTS")
        self.test_get_technician_reports()
        self.test_get_customer_reports()
        
        # Parts catalog
        print("\n📋 PARTS CATALOG TEST")
        self.test_parts_catalog()
        
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("=" * 60)
        
        return self.tests_passed == self.tests_run

def main():
    tester = ACMaintenanceAPITester()
    success = tester.run_all_tests()
    
    # Save results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed': tester.tests_passed,
            'failed': tester.tests_run - tester.tests_passed,
            'success_rate': f"{(tester.tests_passed/tester.tests_run*100):.1f}%",
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
