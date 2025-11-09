import requests
import sys
from datetime import datetime
import json

class ACMaintenanceAPITester:
    def __init__(self, base_url="https://sysmanager.preview.emergentagent.com/api"):
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
        """Test report creation with new dual run capacitor fields"""
        if not self.tech_token:
            self.log_result("Create Report", False, "No technician token available")
            return False
        
        # Test with new 4-field capacitor structure
        payload = {
            "customer_name": "John Doe",
            "customer_email": "john.doe@example.com",
            "customer_phone": "555-1234",
            # Evaporator Details
            "evaporator_brand": "Carrier",
            "evaporator_model_number": "EVP123",
            "evaporator_serial_number": "2015ABC123",
            "evaporator_warranty_status": "Active",
            # Condenser Details
            "condenser_brand": "Carrier",
            "condenser_model_number": "CON456",
            "condenser_serial_number": "2015DEF456",
            "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A",
            "superheat": 8.0,
            "subcooling": 10.0,
            "refrigerant_status": "Good",
            "blower_motor_type": "PSC Motor",
            "blower_motor_capacitor_rating": 7.5,
            "blower_motor_capacitor_reading": 7.3,
            # New 4 separate condenser capacitor fields
            "condenser_capacitor_herm_rating": 35.0,
            "condenser_capacitor_herm_reading": 34.5,  # Good - within 6%
            "condenser_capacitor_fan_rating": 5.0,
            "condenser_capacitor_fan_reading": 4.9,   # Good - within 6%
            "return_temp": 78.0,
            "supply_temp": 60.0,  # Delta T = 18°F - should be good
            "primary_drain": "Clear and flowing",
            "drain_pan_condition": "Good shape",
            "air_filters": "Filters Replaced (Provided by the technician)",
            "evaporator_coil": "Clean",
            "condenser_coils": "Clean",
            "air_purifier": "Good",
            "plenums": "Good",
            "ductwork": "Good",
            "notes": "Test report with new dual run capacitor fields"
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
                
                # Verify report structure with new capacitor fields
                required_fields = ['customer_name', 'condenser_brand', 'delta_t', 'condenser_capacitor_tolerance', 'warnings',
                                 'condenser_capacitor_herm_rating', 'condenser_capacitor_herm_reading',
                                 'condenser_capacitor_fan_rating', 'condenser_capacitor_fan_reading',
                                 'condenser_capacitor_health']
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
                
                # Verify capacitor health is calculated correctly (should be "Good" for this test)
                capacitor_health = data.get('condenser_capacitor_health')
                if capacitor_health != "Good":
                    self.log_result("View Report (Public)", False, f"Expected capacitor health 'Good', got '{capacitor_health}'")
                    return False
                
                self.log_result("View Report (Public)", True, f"Report retrieved successfully with capacitor health: {capacitor_health}")
                return True
            else:
                self.log_result("View Report (Public)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("View Report (Public)", False, f"Error: {str(e)}")
        
        return False

    def test_condenser_capacitor_scenario_1_both_good(self):
        """Test Scenario 1: Both terminals in good condition"""
        if not self.tech_token:
            self.log_result("Condenser Capacitor Scenario 1 (Both Good)", False, "No technician token available")
            return False
        
        payload = {
            "customer_name": "Scenario 1 Test",
            "customer_email": "scenario1@test.com",
            "customer_phone": "555-0001",
            "evaporator_brand": "Test", "evaporator_model_number": "EVP1", "evaporator_serial_number": "EVP001", "evaporator_warranty_status": "Active",
            "condenser_brand": "Test", "condenser_model_number": "CON1", "condenser_serial_number": "CON001", "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A", "superheat": 8.0, "subcooling": 10.0, "refrigerant_status": "Good",
            "blower_motor_type": "ECM Motor",
            "condenser_capacitor_herm_rating": 35.0,
            "condenser_capacitor_herm_reading": 34.5,  # 1.4% off - Good
            "condenser_capacitor_fan_rating": 5.0,
            "condenser_capacitor_fan_reading": 4.9,    # 2% off - Good
            "return_temp": 78.0, "supply_temp": 60.0,
            "primary_drain": "Clear and flowing", "drain_pan_condition": "Good shape",
            "air_filters": "Clean", "evaporator_coil": "Clean", "condenser_coils": "Clean",
            "air_purifier": "Good", "plenums": "Good", "ductwork": "Good"
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                unique_link = data.get('unique_link')
                
                # Fetch the report to check capacitor health
                report_response = requests.get(f"{self.base_url}/reports/{unique_link}")
                if report_response.status_code == 200:
                    report = report_response.json()
                    capacitor_health = report.get('condenser_capacitor_health')
                    
                    if capacitor_health == "Good":
                        self.log_result("Condenser Capacitor Scenario 1 (Both Good)", True, "Both terminals in good condition - health is 'Good'")
                        return True
                    else:
                        self.log_result("Condenser Capacitor Scenario 1 (Both Good)", False, f"Expected 'Good', got '{capacitor_health}'")
                else:
                    self.log_result("Condenser Capacitor Scenario 1 (Both Good)", False, "Failed to fetch created report")
            else:
                self.log_result("Condenser Capacitor Scenario 1 (Both Good)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Condenser Capacitor Scenario 1 (Both Good)", False, f"Error: {str(e)}")
        
        return False

    def test_condenser_capacitor_scenario_2_herm_critical(self):
        """Test Scenario 2: Herm terminal needs replacement (>10% off)"""
        if not self.tech_token:
            self.log_result("Condenser Capacitor Scenario 2 (Herm Critical)", False, "No technician token available")
            return False
        
        payload = {
            "customer_name": "Scenario 2 Test",
            "customer_email": "scenario2@test.com",
            "customer_phone": "555-0002",
            "evaporator_brand": "Test", "evaporator_model_number": "EVP2", "evaporator_serial_number": "EVP002", "evaporator_warranty_status": "Active",
            "condenser_brand": "Test", "condenser_model_number": "CON2", "condenser_serial_number": "CON002", "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A", "superheat": 8.0, "subcooling": 10.0, "refrigerant_status": "Good",
            "blower_motor_type": "ECM Motor",
            "condenser_capacitor_herm_rating": 35.0,
            "condenser_capacitor_herm_reading": 30.0,  # 14.3% off - Critical
            "condenser_capacitor_fan_rating": 5.0,
            "condenser_capacitor_fan_reading": 4.9,    # 2% off - Good
            "return_temp": 78.0, "supply_temp": 60.0,
            "primary_drain": "Clear and flowing", "drain_pan_condition": "Good shape",
            "air_filters": "Clean", "evaporator_coil": "Clean", "condenser_coils": "Clean",
            "air_purifier": "Good", "plenums": "Good", "ductwork": "Good"
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                unique_link = data.get('unique_link')
                
                # Fetch the report to check capacitor health and warnings
                report_response = requests.get(f"{self.base_url}/reports/{unique_link}")
                if report_response.status_code == 200:
                    report = report_response.json()
                    capacitor_health = report.get('condenser_capacitor_health')
                    warnings = report.get('warnings', [])
                    
                    # Should be Critical due to herm terminal
                    if capacitor_health != "Critical":
                        self.log_result("Condenser Capacitor Scenario 2 (Herm Critical)", False, f"Expected 'Critical', got '{capacitor_health}'")
                        return False
                    
                    # Should have condenser_capacitor warning with herm terminal details
                    capacitor_warnings = [w for w in warnings if w['type'] == 'condenser_capacitor']
                    if not capacitor_warnings:
                        self.log_result("Condenser Capacitor Scenario 2 (Herm Critical)", False, "No condenser_capacitor warning found")
                        return False
                    
                    warning_message = capacitor_warnings[0]['message']
                    if "Herm terminal" not in warning_message:
                        self.log_result("Condenser Capacitor Scenario 2 (Herm Critical)", False, f"Warning message should mention Herm terminal: {warning_message}")
                        return False
                    
                    self.log_result("Condenser Capacitor Scenario 2 (Herm Critical)", True, f"Herm terminal critical detected - health is 'Critical', warning: {warning_message}")
                    return True
                else:
                    self.log_result("Condenser Capacitor Scenario 2 (Herm Critical)", False, "Failed to fetch created report")
            else:
                self.log_result("Condenser Capacitor Scenario 2 (Herm Critical)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Condenser Capacitor Scenario 2 (Herm Critical)", False, f"Error: {str(e)}")
        
        return False

    def test_condenser_capacitor_scenario_3_fan_warning(self):
        """Test Scenario 3: Fan terminal in warning range (6-10% off)"""
        if not self.tech_token:
            self.log_result("Condenser Capacitor Scenario 3 (Fan Warning)", False, "No technician token available")
            return False
        
        payload = {
            "customer_name": "Scenario 3 Test",
            "customer_email": "scenario3@test.com",
            "customer_phone": "555-0003",
            "evaporator_brand": "Test", "evaporator_model_number": "EVP3", "evaporator_serial_number": "EVP003", "evaporator_warranty_status": "Active",
            "condenser_brand": "Test", "condenser_model_number": "CON3", "condenser_serial_number": "CON003", "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A", "superheat": 8.0, "subcooling": 10.0, "refrigerant_status": "Good",
            "blower_motor_type": "ECM Motor",
            "condenser_capacitor_herm_rating": 35.0,
            "condenser_capacitor_herm_reading": 34.5,  # 1.4% off - Good
            "condenser_capacitor_fan_rating": 5.0,
            "condenser_capacitor_fan_reading": 4.5,    # 10% off - Warning
            "return_temp": 78.0, "supply_temp": 60.0,
            "primary_drain": "Clear and flowing", "drain_pan_condition": "Good shape",
            "air_filters": "Clean", "evaporator_coil": "Clean", "condenser_coils": "Clean",
            "air_purifier": "Good", "plenums": "Good", "ductwork": "Good"
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                unique_link = data.get('unique_link')
                
                # Fetch the report to check capacitor health
                report_response = requests.get(f"{self.base_url}/reports/{unique_link}")
                if report_response.status_code == 200:
                    report = report_response.json()
                    capacitor_health = report.get('condenser_capacitor_health')
                    warnings = report.get('warnings', [])
                    
                    # Should be Warning due to fan terminal
                    if capacitor_health != "Warning":
                        self.log_result("Condenser Capacitor Scenario 3 (Fan Warning)", False, f"Expected 'Warning', got '{capacitor_health}'")
                        return False
                    
                    # Should have condenser_capacitor warning with fan terminal details
                    capacitor_warnings = [w for w in warnings if w['type'] == 'condenser_capacitor']
                    if not capacitor_warnings:
                        self.log_result("Condenser Capacitor Scenario 3 (Fan Warning)", False, "No condenser_capacitor warning found")
                        return False
                    
                    warning_message = capacitor_warnings[0]['message']
                    if "Fan terminal" not in warning_message:
                        self.log_result("Condenser Capacitor Scenario 3 (Fan Warning)", False, f"Warning message should mention Fan terminal: {warning_message}")
                        return False
                    
                    self.log_result("Condenser Capacitor Scenario 3 (Fan Warning)", True, f"Fan terminal warning detected - health is 'Warning', warning: {warning_message}")
                    return True
                else:
                    self.log_result("Condenser Capacitor Scenario 3 (Fan Warning)", False, "Failed to fetch created report")
            else:
                self.log_result("Condenser Capacitor Scenario 3 (Fan Warning)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Condenser Capacitor Scenario 3 (Fan Warning)", False, f"Error: {str(e)}")
        
        return False

    def test_condenser_capacitor_scenario_4_both_critical(self):
        """Test Scenario 4: Both terminals need replacement (>10% off)"""
        if not self.tech_token:
            self.log_result("Condenser Capacitor Scenario 4 (Both Critical)", False, "No technician token available")
            return False
        
        payload = {
            "customer_name": "Scenario 4 Test",
            "customer_email": "scenario4@test.com",
            "customer_phone": "555-0004",
            "evaporator_brand": "Test", "evaporator_model_number": "EVP4", "evaporator_serial_number": "EVP004", "evaporator_warranty_status": "Active",
            "condenser_brand": "Test", "condenser_model_number": "CON4", "condenser_serial_number": "CON004", "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A", "superheat": 8.0, "subcooling": 10.0, "refrigerant_status": "Good",
            "blower_motor_type": "ECM Motor",
            "condenser_capacitor_herm_rating": 35.0,
            "condenser_capacitor_herm_reading": 28.0,  # 20% off - Critical
            "condenser_capacitor_fan_rating": 5.0,
            "condenser_capacitor_fan_reading": 3.0,    # 40% off - Critical
            "return_temp": 78.0, "supply_temp": 60.0,
            "primary_drain": "Clear and flowing", "drain_pan_condition": "Good shape",
            "air_filters": "Clean", "evaporator_coil": "Clean", "condenser_coils": "Clean",
            "air_purifier": "Good", "plenums": "Good", "ductwork": "Good"
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                unique_link = data.get('unique_link')
                
                # Fetch the report to check capacitor health and warnings
                report_response = requests.get(f"{self.base_url}/reports/{unique_link}")
                if report_response.status_code == 200:
                    report = report_response.json()
                    capacitor_health = report.get('condenser_capacitor_health')
                    warnings = report.get('warnings', [])
                    
                    # Should be Critical due to both terminals
                    if capacitor_health != "Critical":
                        self.log_result("Condenser Capacitor Scenario 4 (Both Critical)", False, f"Expected 'Critical', got '{capacitor_health}'")
                        return False
                    
                    # Should have condenser_capacitor warning mentioning both terminals
                    capacitor_warnings = [w for w in warnings if w['type'] == 'condenser_capacitor']
                    if not capacitor_warnings:
                        self.log_result("Condenser Capacitor Scenario 4 (Both Critical)", False, "No condenser_capacitor warning found")
                        return False
                    
                    warning_message = capacitor_warnings[0]['message']
                    if "Herm terminal" not in warning_message or "Fan terminal" not in warning_message:
                        self.log_result("Condenser Capacitor Scenario 4 (Both Critical)", False, f"Warning message should mention both terminals: {warning_message}")
                        return False
                    
                    self.log_result("Condenser Capacitor Scenario 4 (Both Critical)", True, f"Both terminals critical detected - health is 'Critical', warning: {warning_message}")
                    return True
                else:
                    self.log_result("Condenser Capacitor Scenario 4 (Both Critical)", False, "Failed to fetch created report")
            else:
                self.log_result("Condenser Capacitor Scenario 4 (Both Critical)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Condenser Capacitor Scenario 4 (Both Critical)", False, f"Error: {str(e)}")
        
        return False

    def test_tolerance_calculations(self):
        """Test tolerance calculations with specific values"""
        if not self.tech_token:
            self.log_result("Tolerance Calculations", False, "No technician token available")
            return False
        
        # Test case 1: Critical capacitor (>10% off) with new fields
        payload = {
            "customer_name": "Test Critical",
            "customer_email": "test@example.com",
            "customer_phone": "555-0000",
            "evaporator_brand": "Test", "evaporator_model_number": "EVP", "evaporator_serial_number": "TEST123", "evaporator_warranty_status": "Active",
            "condenser_brand": "Test", "condenser_model_number": "CON", "condenser_serial_number": "TEST456", "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A", "superheat": 8.0, "subcooling": 10.0, "refrigerant_status": "Good",
            "blower_motor_type": "ECM Motor",
            "condenser_capacitor_herm_rating": 35.0,
            "condenser_capacitor_herm_reading": 30.0,  # 14.3% off - should be critical
            "condenser_capacitor_fan_rating": 5.0,
            "condenser_capacitor_fan_reading": 4.5,   # 10% off - should be warning
            "return_temp": 78.0,
            "supply_temp": 68.0,  # Delta T = 10°F - should be critical
            "primary_drain": "Clear and flowing", "drain_pan_condition": "Good shape",
            "air_filters": "Clean", "evaporator_coil": "Clean", "condenser_coils": "Clean",
            "air_purifier": "Good", "plenums": "Good", "ductwork": "Good"
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
                    
                    # Should have warnings for condenser_capacitor and delta_t (no amp_draw anymore)
                    warning_types = [w['type'] for w in warnings]
                    
                    expected_warnings = ['condenser_capacitor', 'delta_t']
                    missing_warnings = [w for w in expected_warnings if w not in warning_types]
                    
                    if missing_warnings:
                        self.log_result("Tolerance Calculations", False, f"Missing warnings: {missing_warnings}")
                        return False
                    
                    # Check severity
                    capacitor_warning = next((w for w in warnings if w['type'] == 'condenser_capacitor'), None)
                    if capacitor_warning and capacitor_warning['severity'] != 'critical':
                        self.log_result("Tolerance Calculations", False, f"Condenser capacitor severity should be critical, got {capacitor_warning['severity']}")
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
            "evaporator_brand": "Test", "evaporator_model_number": "EVP", "evaporator_serial_number": "2010ABC123", "evaporator_warranty_status": "Active",
            "condenser_brand": "Test", "condenser_model_number": "CON", "condenser_serial_number": "2010DEF456", "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A", "superheat": 8.0, "subcooling": 10.0, "refrigerant_status": "Good",
            "blower_motor_type": "ECM Motor",
            "condenser_capacitor_herm_rating": 35.0,
            "condenser_capacitor_herm_reading": 35.0,
            "condenser_capacitor_fan_rating": 5.0,
            "condenser_capacitor_fan_reading": 5.0,
            "return_temp": 78.0, "supply_temp": 60.0,
            "primary_drain": "Clear and flowing", "drain_pan_condition": "Good shape",
            "air_filters": "Clean", "evaporator_coil": "Clean", "condenser_coils": "Clean",
            "air_purifier": "Good", "plenums": "Good", "ductwork": "Good"
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

    def test_electrical_section_removal(self):
        """Test that electrical fields are removed and API works without them"""
        if not self.tech_token:
            self.log_result("Electrical Section Removal", False, "No technician token available")
            return False
        
        # Test report creation WITHOUT electrical fields
        payload = {
            "customer_name": "John Smith",
            "customer_email": "john.smith@example.com",
            "customer_phone": "555-9876",
            # Evaporator Details
            "evaporator_brand": "Lennox",
            "evaporator_model_number": "CBA25UH-048",
            "evaporator_serial_number": "2020ABC123",
            "evaporator_warranty_status": "Active",
            # Condenser Details
            "condenser_brand": "Lennox",
            "condenser_model_number": "13ACX-048",
            "condenser_serial_number": "2020DEF456",
            "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A",
            "superheat": 9.5,
            "subcooling": 12.0,
            "refrigerant_status": "Good",
            "blower_motor_type": "PSC Motor",
            "blower_motor_capacitor_rating": 7.5,
            "blower_motor_capacitor_reading": 7.2,
            # Condenser dual run capacitor fields (4 separate fields)
            "condenser_capacitor_herm_rating": 35.0,
            "condenser_capacitor_herm_reading": 34.8,
            "condenser_capacitor_fan_rating": 5.0,
            "condenser_capacitor_fan_reading": 4.9,
            "return_temp": 76.0,
            "supply_temp": 58.0,  # Delta T = 18°F - Good
            # NO electrical fields: amp_draw, rated_amps, electrical_photos
            "primary_drain": "Clear and flowing",
            "drain_pan_condition": "Good shape",
            "air_filters": "Filters Replaced (Provided by the technician)",
            "filters_list": [{"size": "16x25x1", "quantity": 2}],
            "evaporator_coil": "Clean",
            "condenser_coils": "Cleaned with Fresh Water",
            "air_purifier": "Good",
            "plenums": "Good",
            "ductwork": "Good",
            "notes": "Test report without electrical section"
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                unique_link = data.get('unique_link')
                
                # Fetch the report to verify electrical fields are not present
                report_response = requests.get(f"{self.base_url}/reports/{unique_link}")
                if report_response.status_code == 200:
                    report = report_response.json()
                    
                    # Verify electrical fields are NOT in the response
                    electrical_fields = ['amp_draw', 'rated_amps', 'amp_status', 'electrical_photos']
                    found_electrical_fields = [field for field in electrical_fields if field in report]
                    
                    if found_electrical_fields:
                        self.log_result("Electrical Section Removal", False, f"Found electrical fields that should be removed: {found_electrical_fields}")
                        return False
                    
                    # Verify performance score calculation works without amp draw
                    performance_score = report.get('performance_score')
                    if performance_score is None:
                        self.log_result("Electrical Section Removal", False, "Performance score not calculated")
                        return False
                    
                    # Verify warnings don't include amp draw warnings
                    warnings = report.get('warnings', [])
                    amp_warnings = [w for w in warnings if 'amp' in w.get('message', '').lower() or w.get('type') == 'amp_draw']
                    
                    if amp_warnings:
                        self.log_result("Electrical Section Removal", False, f"Found amp draw warnings that should be removed: {amp_warnings}")
                        return False
                    
                    # Verify Delta T calculations still work
                    expected_delta_t = 76.0 - 58.0  # 18°F
                    actual_delta_t = report.get('delta_t')
                    
                    if abs(actual_delta_t - expected_delta_t) > 0.1:
                        self.log_result("Electrical Section Removal", False, f"Delta T calculation wrong: expected {expected_delta_t}, got {actual_delta_t}")
                        return False
                    
                    # Verify capacitor health calculations still work
                    capacitor_health = report.get('condenser_capacitor_health')
                    if not capacitor_health:
                        self.log_result("Electrical Section Removal", False, "Capacitor health not calculated")
                        return False
                    
                    self.log_result("Electrical Section Removal", True, 
                                  f"✅ Report created successfully without electrical fields. "
                                  f"Performance score: {performance_score}, Delta T: {actual_delta_t}°F, "
                                  f"Capacitor health: {capacitor_health}, Warnings: {len(warnings)}")
                    return True
                else:
                    self.log_result("Electrical Section Removal", False, "Failed to fetch created report")
            else:
                self.log_result("Electrical Section Removal", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Electrical Section Removal", False, f"Error: {str(e)}")
        
        return False

    def test_electrical_fields_rejection(self):
        """Test that API rejects requests with old electrical fields"""
        if not self.tech_token:
            self.log_result("Electrical Fields Rejection", False, "No technician token available")
            return False
        
        # Test with old electrical fields that should be rejected
        payload = {
            "customer_name": "Test Rejection",
            "customer_email": "test.rejection@example.com",
            "customer_phone": "555-0000",
            "evaporator_brand": "Test", "evaporator_model_number": "EVP", "evaporator_serial_number": "TEST123", "evaporator_warranty_status": "Active",
            "condenser_brand": "Test", "condenser_model_number": "CON", "condenser_serial_number": "TEST456", "condenser_warranty_status": "Active",
            "refrigerant_type": "R-410A", "superheat": 8.0, "subcooling": 10.0, "refrigerant_status": "Good",
            "blower_motor_type": "ECM Motor",
            "condenser_capacitor_herm_rating": 35.0, "condenser_capacitor_herm_reading": 35.0,
            "condenser_capacitor_fan_rating": 5.0, "condenser_capacitor_fan_reading": 5.0,
            "return_temp": 78.0, "supply_temp": 60.0,
            # Include old electrical fields that should be rejected
            "amp_draw": 18.5,
            "rated_amps": 20.0,
            "electrical_photos": ["base64image"],
            "primary_drain": "Clear and flowing", "drain_pan_condition": "Good shape",
            "air_filters": "Clean", "evaporator_coil": "Clean", "condenser_coils": "Clean",
            "air_purifier": "Good", "plenums": "Good", "ductwork": "Good"
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.tech_token}'}
            response = requests.post(f"{self.base_url}/reports/create", json=payload, headers=headers)
            
            # The API should either reject the request (422) or ignore the electrical fields and succeed (200)
            if response.status_code == 422:
                # API properly rejects unknown fields
                self.log_result("Electrical Fields Rejection", True, "API properly rejects requests with old electrical fields")
                return True
            elif response.status_code == 200:
                # API ignores unknown fields - verify electrical fields are not in response
                data = response.json()
                unique_link = data.get('unique_link')
                
                report_response = requests.get(f"{self.base_url}/reports/{unique_link}")
                if report_response.status_code == 200:
                    report = report_response.json()
                    electrical_fields = ['amp_draw', 'rated_amps', 'amp_status', 'electrical_photos']
                    found_electrical_fields = [field for field in electrical_fields if field in report]
                    
                    if found_electrical_fields:
                        self.log_result("Electrical Fields Rejection", False, f"API accepted and stored electrical fields: {found_electrical_fields}")
                        return False
                    else:
                        self.log_result("Electrical Fields Rejection", True, "API ignores old electrical fields (not stored in response)")
                        return True
                else:
                    self.log_result("Electrical Fields Rejection", False, "Failed to fetch created report")
            else:
                self.log_result("Electrical Fields Rejection", False, f"Unexpected status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Electrical Fields Rejection", False, f"Error: {str(e)}")
        
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
        
        # ELECTRICAL SECTION REMOVAL TESTS (Priority)
        print("\n📋 ELECTRICAL SECTION REMOVAL TESTS")
        self.test_electrical_section_removal()
        self.test_electrical_fields_rejection()
        
        # Report tests
        print("\n📋 REPORT TESTS")
        self.test_create_report()
        self.test_view_report_public()
        
        # Condenser Dual Run Capacitor Tests
        print("\n📋 CONDENSER DUAL RUN CAPACITOR TESTS")
        self.test_condenser_capacitor_scenario_1_both_good()
        self.test_condenser_capacitor_scenario_2_herm_critical()
        self.test_condenser_capacitor_scenario_3_fan_warning()
        self.test_condenser_capacitor_scenario_4_both_critical()
        
        print("\n📋 OTHER TOLERANCE TESTS")
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
