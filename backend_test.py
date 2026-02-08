#!/usr/bin/env python3
"""
Backend API Test Suite for eCalc RO - Professional Edition
Tests the fiscal rules API endpoints as requested.
"""

import requests
import json
import os
from typing import Dict, Any

class FiscalRulesAPITester:
    def __init__(self):
        # Get base URL from environment - this is the external URL for production
        self.base_url = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://dynamic-payroll-calc.preview.emergentagent.com')
        self.api_url = f"{self.base_url}/api"
        
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'test_details': []
        }
        
    def log_result(self, test_name: str, passed: bool, details: str):
        """Log test result"""
        self.results['total_tests'] += 1
        if passed:
            self.results['passed'] += 1
            print(f"✅ {test_name}: PASSED - {details}")
        else:
            self.results['failed'] += 1
            print(f"❌ {test_name}: FAILED - {details}")
            
        self.results['test_details'].append({
            'test': test_name,
            'status': 'PASSED' if passed else 'FAILED',
            'details': details
        })
    
    def test_get_fiscal_rules_2026(self) -> bool:
        """Test GET /api/fiscal-rules/2026"""
        try:
            response = requests.get(f"{self.api_url}/fiscal-rules/2026", timeout=10)
            
            if response.status_code != 200:
                self.log_result("GET /api/fiscal-rules/2026", False, f"Status code: {response.status_code}")
                return False
            
            data = response.json()
            
            # Check if required fields exist
            required_fields = [
                'salary.cas_rate',
                'salary.cass_rate', 
                'salary.income_tax_rate',
                'salary.personal_deduction_base',
                'salary.child_deduction',
                'salary.youth_exemption_threshold'
            ]
            
            missing_fields = []
            for field in required_fields:
                keys = field.split('.')
                current = data
                for key in keys:
                    if key not in current:
                        missing_fields.append(field)
                        break
                    current = current[key]
            
            if missing_fields:
                self.log_result("GET /api/fiscal-rules/2026", False, f"Missing fields: {', '.join(missing_fields)}")
                return False
            
            # Check if values are numbers, not strings
            numeric_checks = [
                ('salary.cas_rate', data['salary']['cas_rate']),
                ('salary.cass_rate', data['salary']['cass_rate']),
                ('salary.income_tax_rate', data['salary']['income_tax_rate']),
                ('salary.personal_deduction_base', data['salary']['personal_deduction_base']),
                ('salary.child_deduction', data['salary']['child_deduction']),
                ('salary.youth_exemption_threshold', data['salary']['youth_exemption_threshold'])
            ]
            
            non_numeric = []
            for field_name, value in numeric_checks:
                if not isinstance(value, (int, float)):
                    non_numeric.append(f"{field_name}: {type(value).__name__}")
            
            if non_numeric:
                self.log_result("GET /api/fiscal-rules/2026", False, f"Non-numeric values: {', '.join(non_numeric)}")
                return False
                
            # Check specific expected values for 2026
            expected_values = {
                'salary.cas_rate': 25,
                'salary.cass_rate': 10,
                'salary.income_tax_rate': 10,
                'salary.personal_deduction_base': 510,
                'salary.child_deduction': 100,
                'salary.youth_exemption_threshold': 6050
            }
            
            value_mismatches = []
            for field, expected in expected_values.items():
                keys = field.split('.')
                actual = data
                for key in keys:
                    actual = actual[key]
                if actual != expected:
                    value_mismatches.append(f"{field}: expected {expected}, got {actual}")
            
            if value_mismatches:
                self.log_result("GET /api/fiscal-rules/2026", False, f"Value mismatches: {'; '.join(value_mismatches)}")
                return False
                
            self.log_result("GET /api/fiscal-rules/2026", True, f"All required fields present with correct values. Year: {data['year']}")
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_result("GET /api/fiscal-rules/2026", False, f"Request error: {str(e)}")
            return False
        except Exception as e:
            self.log_result("GET /api/fiscal-rules/2026", False, f"Unexpected error: {str(e)}")
            return False
    
    def test_get_fiscal_rules_2025(self) -> bool:
        """Test GET /api/fiscal-rules/2025 for comparison with 2026"""
        try:
            response = requests.get(f"{self.api_url}/fiscal-rules/2025", timeout=10)
            
            if response.status_code != 200:
                self.log_result("GET /api/fiscal-rules/2025", False, f"Status code: {response.status_code}")
                return False
            
            data = response.json()
            
            # Check if it's different from 2026 (especially minimum_salary and youth_exemption_threshold)
            expected_2025_values = {
                'year': 2025,
                'salary.minimum_salary': 3700,
                'salary.youth_exemption_threshold': 5700  # 3700 + 2000
            }
            
            value_checks = []
            for field, expected in expected_2025_values.items():
                if field == 'year':
                    actual = data['year']
                else:
                    keys = field.split('.')
                    actual = data
                    for key in keys:
                        actual = actual[key]
                        
                if actual != expected:
                    value_checks.append(f"{field}: expected {expected}, got {actual}")
            
            if value_checks:
                self.log_result("GET /api/fiscal-rules/2025", False, f"Value mismatches: {'; '.join(value_checks)}")
                return False
            
            self.log_result("GET /api/fiscal-rules/2025", True, f"2025 data correct with minimum_salary={data['salary']['minimum_salary']}, youth_threshold={data['salary']['youth_exemption_threshold']}")
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_result("GET /api/fiscal-rules/2025", False, f"Request error: {str(e)}")
            return False
        except Exception as e:
            self.log_result("GET /api/fiscal-rules/2025", False, f"Unexpected error: {str(e)}")
            return False
    
    def test_put_fiscal_rules_2026(self) -> bool:
        """Test PUT /api/fiscal-rules/2026 - update child_deduction from 100 to 150 and back to 100"""
        try:
            # First, get current data
            response = requests.get(f"{self.api_url}/fiscal-rules/2026", timeout=10)
            if response.status_code != 200:
                self.log_result("PUT /api/fiscal-rules/2026", False, "Cannot get current data for update test")
                return False
            
            original_data = response.json()
            original_child_deduction = original_data['salary']['child_deduction']
            
            # Test 1: Update child_deduction to 150
            update_data = original_data.copy()
            # Remove _id to avoid MongoDB immutable field error
            if '_id' in update_data:
                del update_data['_id']
            update_data['salary']['child_deduction'] = 150
            
            response = requests.put(
                f"{self.api_url}/fiscal-rules/2026",
                json=update_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result("PUT /api/fiscal-rules/2026", False, f"Update to 150 failed with status: {response.status_code}")
                return False
            
            # Verify the update
            verify_response = requests.get(f"{self.api_url}/fiscal-rules/2026", timeout=10)
            if verify_response.status_code != 200:
                self.log_result("PUT /api/fiscal-rules/2026", False, "Cannot verify update to 150")
                return False
            
            verify_data = verify_response.json()
            if verify_data['salary']['child_deduction'] != 150:
                self.log_result("PUT /api/fiscal-rules/2026", False, f"Update to 150 not persisted. Got: {verify_data['salary']['child_deduction']}")
                return False
            
            # Test 2: Update child_deduction back to 100
            update_data['salary']['child_deduction'] = 100
            
            response = requests.put(
                f"{self.api_url}/fiscal-rules/2026",
                json=update_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result("PUT /api/fiscal-rules/2026", False, f"Update back to 100 failed with status: {response.status_code}")
                return False
            
            # Verify the rollback
            verify_response = requests.get(f"{self.api_url}/fiscal-rules/2026", timeout=10)
            if verify_response.status_code != 200:
                self.log_result("PUT /api/fiscal-rules/2026", False, "Cannot verify rollback to 100")
                return False
            
            verify_data = verify_response.json()
            if verify_data['salary']['child_deduction'] != 100:
                self.log_result("PUT /api/fiscal-rules/2026", False, f"Rollback to 100 not persisted. Got: {verify_data['salary']['child_deduction']}")
                return False
            
            self.log_result("PUT /api/fiscal-rules/2026", True, "Successfully updated child_deduction 100→150→100, without sending _id in body")
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_result("PUT /api/fiscal-rules/2026", False, f"Request error: {str(e)}")
            return False
        except Exception as e:
            self.log_result("PUT /api/fiscal-rules/2026", False, f"Unexpected error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all fiscal rules API tests"""
        print(f"🚀 Starting Fiscal Rules API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"📍 API URL: {self.api_url}")
        print("-" * 80)
        
        # Run tests in specific order
        test_methods = [
            self.test_get_fiscal_rules_2026,
            self.test_get_fiscal_rules_2025, 
            self.test_put_fiscal_rules_2026
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                self.log_result(test_method.__name__, False, f"Test execution error: {str(e)}")
        
        print("-" * 80)
        print(f"📊 TEST SUMMARY")
        print(f"   Total Tests: {self.results['total_tests']}")
        print(f"   ✅ Passed: {self.results['passed']}")
        print(f"   ❌ Failed: {self.results['failed']}")
        
        if self.results['failed'] == 0:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("⚠️  SOME TESTS FAILED")
            print("\nFailed Tests:")
            for detail in self.results['test_details']:
                if detail['status'] == 'FAILED':
                    print(f"   - {detail['test']}: {detail['details']}")
        
        return self.results['failed'] == 0

def main():
    """Main test execution"""
    print("=== eCalc RO - Backend API Test Suite ===")
    
    tester = FiscalRulesAPITester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())