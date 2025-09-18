#!/usr/bin/env node

/**
 * AlphaEngine Automated Flow Testing Script
 * Tests all available flows and API endpoints
 */

const https = require('https');
const http = require('http');

class AlphaEngineFlowTester {
    constructor() {
        this.frontendUrl = 'http://localhost:3000';
        this.backendUrl = 'http://localhost:3001';
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type}] ${message}`);
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const module = urlObj.protocol === 'https:' ? https : http;

            const req = module.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            });

            req.on('error', reject);
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    async runTest(testName, testFunction) {
        this.testCount++;
        this.log(`Running test: ${testName}`);

        try {
            const result = await testFunction();
            if (result.success) {
                this.passCount++;
                this.log(`✅ PASS: ${testName} - ${result.message}`, 'PASS');
            } else {
                this.failCount++;
                this.log(`❌ FAIL: ${testName} - ${result.message}`, 'FAIL');
            }
            this.results.push({ testName, ...result });
        } catch (error) {
            this.failCount++;
            this.log(`❌ ERROR: ${testName} - ${error.message}`, 'ERROR');
            this.results.push({ testName, success: false, message: error.message });
        }
    }

    // Test 1: Frontend Home Page
    async testFrontendHomePage() {
        const response = await this.makeRequest(this.frontendUrl);

        if (response.statusCode === 200) {
            return { success: true, message: 'Frontend home page loads successfully' };
        } else if (response.statusCode === 308) {
            return { success: true, message: 'Frontend redirects properly (308)' };
        } else {
            return { success: false, message: `Unexpected status code: ${response.statusCode}` };
        }
    }

    // Test 2: Backend Health Check
    async testBackendHealth() {
        const response = await this.makeRequest(this.backendUrl);

        if (response.statusCode === 200) {
            return { success: true, message: 'Backend server is responding' };
        } else {
            return { success: false, message: `Backend returned status: ${response.statusCode}` };
        }
    }

    // Test 3: Frontend Login Page
    async testLoginPage() {
        const response = await this.makeRequest(`${this.frontendUrl}/login`);

        if (response.statusCode === 200) {
            return { success: true, message: 'Login page loads successfully' };
        } else {
            return { success: false, message: `Login page returned status: ${response.statusCode}` };
        }
    }

    // Test 4: Frontend User Type Selection Page
    async testUserTypeSelectionPage() {
        const response = await this.makeRequest(`${this.frontendUrl}/login/selectUserType`);

        if (response.statusCode === 200) {
            return { success: true, message: 'User type selection page loads successfully' };
        } else {
            return { success: false, message: `User type selection returned status: ${response.statusCode}` };
        }
    }

    // Test 5: Alpha Generator Dashboard Page
    async testAlphaGeneratorDashboard() {
        const response = await this.makeRequest(`${this.frontendUrl}/alpha-generator/dashboard`);

        if (response.statusCode === 200) {
            return { success: true, message: 'Alpha Generator dashboard loads successfully' };
        } else {
            return { success: false, message: `Alpha Generator dashboard returned status: ${response.statusCode}` };
        }
    }

    // Test 6: Alpha Consumer Dashboard Page
    async testAlphaConsumerDashboard() {
        const response = await this.makeRequest(`${this.frontendUrl}/alpha-consumer/dashboard`);

        if (response.statusCode === 200) {
            return { success: true, message: 'Alpha Consumer dashboard loads successfully' };
        } else {
            return { success: false, message: `Alpha Consumer dashboard returned status: ${response.statusCode}` };
        }
    }

    // Test 7: Backend API - Strategies Endpoint
    async testStrategiesAPI() {
        try {
            const response = await this.makeRequest(`${this.backendUrl}/api/strategies`);

            if (response.statusCode === 200) {
                return { success: true, message: 'Strategies API endpoint is accessible' };
            } else if (response.statusCode === 401) {
                return { success: true, message: 'Strategies API returns 401 (authentication required)' };
            } else {
                return { success: false, message: `Strategies API returned status: ${response.statusCode}` };
            }
        } catch (error) {
            if (error.message.includes('ECONNREFUSED')) {
                return { success: false, message: 'Backend server is not running' };
            }
            throw error;
        }
    }

    // Test 8: Frontend Strategy Creation Page
    async testStrategyCreationPage() {
        const response = await this.makeRequest(`${this.frontendUrl}/alpha-generator/strategies/create`);

        if (response.statusCode === 200) {
            return { success: true, message: 'Strategy creation page loads successfully' };
        } else {
            return { success: false, message: `Strategy creation page returned status: ${response.statusCode}` };
        }
    }

    // Test 9: Frontend Strategies List Page
    async testStrategiesListPage() {
        const response = await this.makeRequest(`${this.frontendUrl}/alpha-generator/strategies`);

        if (response.statusCode === 200) {
            return { success: true, message: 'Strategies list page loads successfully' };
        } else {
            return { success: false, message: `Strategies list page returned status: ${response.statusCode}` };
        }
    }

    // Test 10: Frontend Alpha Consumer Strategies Page
    async testAlphaConsumerStrategiesPage() {
        const response = await this.makeRequest(`${this.frontendUrl}/alpha-consumer/strategies`);

        if (response.statusCode === 200) {
            return { success: true, message: 'Alpha Consumer strategies page loads successfully' };
        } else {
            return { success: false, message: `Alpha Consumer strategies page returned status: ${response.statusCode}` };
        }
    }

    // Test 11: Check for common JavaScript errors by examining page content
    async testPageContentForErrors() {
        try {
            const response = await this.makeRequest(this.frontendUrl);

            if (response.body.includes('Error') && response.body.includes('500')) {
                return { success: false, message: 'Frontend page contains error content' };
            }

            if (response.body.includes('<!DOCTYPE html') || response.body.includes('<html')) {
                return { success: true, message: 'Frontend returns valid HTML content' };
            } else {
                return { success: false, message: 'Frontend does not return valid HTML' };
            }
        } catch (error) {
            return { success: false, message: `Could not fetch page content: ${error.message}` };
        }
    }

    async runAllTests() {
        this.log('🚀 Starting AlphaEngine Flow Testing...');
        this.log('=' * 60);

        // Core connectivity tests
        await this.runTest('Frontend Home Page', () => this.testFrontendHomePage());
        await this.runTest('Backend Health Check', () => this.testBackendHealth());
        await this.runTest('Page Content Validation', () => this.testPageContentForErrors());

        // Authentication flow tests
        await this.runTest('Login Page', () => this.testLoginPage());
        await this.runTest('User Type Selection Page', () => this.testUserTypeSelectionPage());

        // Alpha Generator flow tests
        await this.runTest('Alpha Generator Dashboard', () => this.testAlphaGeneratorDashboard());
        await this.runTest('Strategy Creation Page', () => this.testStrategyCreationPage());
        await this.runTest('Strategies List Page', () => this.testStrategiesListPage());

        // Alpha Consumer flow tests
        await this.runTest('Alpha Consumer Dashboard', () => this.testAlphaConsumerDashboard());
        await this.runTest('Alpha Consumer Strategies Page', () => this.testAlphaConsumerStrategiesPage());

        // Backend API tests
        await this.runTest('Strategies API Endpoint', () => this.testStrategiesAPI());

        this.generateReport();
    }

    generateReport() {
        this.log('=' * 60);
        this.log('🏁 Testing Complete!');
        this.log(`Total Tests: ${this.testCount}`);
        this.log(`Passed: ${this.passCount}`);
        this.log(`Failed: ${this.failCount}`);
        this.log(`Success Rate: ${((this.passCount / this.testCount) * 100).toFixed(1)}%`);
        this.log('=' * 60);

        if (this.failCount > 0) {
            this.log('❌ Failed Tests:');
            this.results
                .filter(result => !result.success)
                .forEach(result => {
                    this.log(`  - ${result.testName}: ${result.message}`);
                });
        }

        this.log('💡 Next Steps:');
        this.log('  1. Check chrome-monitor logs for console errors');
        this.log('  2. Test wallet connection manually in browser');
        this.log('  3. Verify database connectivity for full functionality');
    }
}

// Run the tests
async function main() {
    const tester = new AlphaEngineFlowTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AlphaEngineFlowTester };