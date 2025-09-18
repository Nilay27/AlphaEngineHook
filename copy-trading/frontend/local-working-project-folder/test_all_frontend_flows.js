#!/usr/bin/env node
/**
 * Comprehensive Frontend Flow Testing Script
 * Created: 17-September-2025-09:45AM
 * Purpose: Test all AlphaEngine frontend flows systematically
 */

const fs = require('fs');
const path = require('path');

// All URLs to test
const TEST_URLS = [
    // Landing Page
    'http://localhost:3000/',

    // Authentication Flow
    'http://localhost:3000/login',
    'http://localhost:3000/login/selectUserType',

    // Alpha Generator Flow
    'http://localhost:3000/alpha-generator/dashboard',
    'http://localhost:3000/alpha-generator/strategies',
    'http://localhost:3000/alpha-generator/strategies/create',
    'http://localhost:3000/alpha-generator/performance',
    'http://localhost:3000/alpha-generator/subscribers',
    'http://localhost:3000/alpha-generator/strategies/test-strategy-1',

    // Alpha Consumer Flow
    'http://localhost:3000/alpha-consumer/dashboard',
    'http://localhost:3000/alpha-consumer/strategies',
    'http://localhost:3000/alpha-consumer/subscriptions',
    'http://localhost:3000/alpha-consumer/confirmations',
    'http://localhost:3000/alpha-consumer/strategies/test-strategy-1'
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testURL(url) {
    console.log(`\n🔍 Testing: ${url}`);

    try {
        // Use Chrome DevTools Protocol to navigate
        const WebSocket = require('ws');

        // Get the first tab
        const response = await fetch('http://localhost:9222/json');
        const tabs = await response.json();

        // Find the main tab (not extension pages)
        const mainTab = tabs.find(tab =>
            !tab.url.includes('chrome-extension://') &&
            !tab.url.includes('ledger-iframe')
        );

        if (!mainTab) {
            console.log('❌ No main tab found');
            return { url, status: 'error', error: 'No main tab found' };
        }

        // Create WebSocket connection to the tab
        const ws = new WebSocket(mainTab.webSocketDebuggerUrl);

        return new Promise((resolve) => {
            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    ws.close();
                    resolve({ url, status: 'timeout', error: 'Navigation timeout' });
                }
            }, 10000);

            ws.on('open', () => {
                console.log(`📡 Connected to tab: ${mainTab.title}`);

                // Enable necessary domains
                ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
                ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
                ws.send(JSON.stringify({ id: 3, method: 'Network.enable' }));

                // Navigate to URL
                ws.send(JSON.stringify({
                    id: 4,
                    method: 'Page.navigate',
                    params: { url }
                }));
            });

            ws.on('message', (data) => {
                const message = JSON.parse(data);

                // Check for navigation response
                if (message.id === 4) {
                    if (message.error) {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeout);
                            ws.close();
                            resolve({ url, status: 'error', error: message.error.message });
                        }
                    }
                }

                // Check for page load events
                if (message.method === 'Page.loadEventFired') {
                    console.log(`✅ Page loaded successfully`);

                    // Wait a bit for any redirects/JS execution
                    setTimeout(() => {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeout);

                            // Get final URL
                            ws.send(JSON.stringify({
                                id: 5,
                                method: 'Runtime.evaluate',
                                params: { expression: 'window.location.href' }
                            }));
                        }
                    }, 2000);
                }

                // Handle final URL response
                if (message.id === 5 && message.result) {
                    const finalUrl = message.result.result.value;
                    const redirected = finalUrl !== url;

                    ws.close();
                    resolve({
                        url,
                        status: 'success',
                        finalUrl,
                        redirected,
                        timestamp: new Date().toISOString()
                    });
                }

                // Log console errors
                if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
                    console.log(`🚨 Console Error: ${message.params.args.map(arg => arg.value || arg.description).join(' ')}`);
                }
            });

            ws.on('error', (error) => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve({ url, status: 'error', error: error.message });
                }
            });
        });

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return { url, status: 'error', error: error.message };
    }
}

async function runTests() {
    console.log('🚀 Starting Comprehensive Frontend Testing');
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`🔗 Testing ${TEST_URLS.length} URLs\n`);

    const results = [];

    for (const url of TEST_URLS) {
        const result = await testURL(url);
        results.push(result);

        console.log(`Status: ${result.status}`);
        if (result.redirected) {
            console.log(`↪️ Redirected to: ${result.finalUrl}`);
        }
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        }

        // Wait between tests
        await sleep(1000);
    }

    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTING RESULTS SUMMARY');
    console.log('='.repeat(60));

    let successCount = 0;
    let errorCount = 0;
    let timeoutCount = 0;

    results.forEach((result, index) => {
        const status = result.status === 'success' ? '✅' :
                      result.status === 'error' ? '❌' :
                      result.status === 'timeout' ? '⏰' : '❓';

        console.log(`${index + 1}. ${status} ${result.url}`);

        if (result.redirected) {
            console.log(`   ↪️ Redirected to: ${result.finalUrl}`);
        }
        if (result.error) {
            console.log(`   ❌ Error: ${result.error}`);
        }

        if (result.status === 'success') successCount++;
        else if (result.status === 'error') errorCount++;
        else if (result.status === 'timeout') timeoutCount++;
    });

    console.log('\n' + '-'.repeat(40));
    console.log(`📈 Total URLs tested: ${results.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⏰ Timeouts: ${timeoutCount}`);

    // Save results to file
    const reportPath = path.join(__dirname, `frontend-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`💾 Detailed results saved to: ${reportPath}`);

    return results;
}

// Run if called directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, TEST_URLS };