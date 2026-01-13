import { API_BASE_URL } from './api-client';

/**
 * Network diagnostics utilities to help troubleshoot connectivity issues
 */

export async function testBackendConnectivity() {
  console.log('🔍 Testing backend connectivity...');
  console.log(`  Backend URL: ${API_BASE_URL}`);

  try {
    // Test simple GET request to root endpoint
    console.log('  1️⃣ Testing GET / endpoint...');
    const testRes = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`  ✅ GET / returned: ${testRes.status} ${testRes.statusText}`);
    const text = await testRes.text();
    console.log(`  Response body: ${text}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Backend connectivity test failed:');
    console.error(`  Error: ${error.message}`);
    console.error(`  Error type: ${error.constructor.name}`);
    
    // Additional diagnostics
    console.error('🔧 Diagnostic suggestions:');
    console.error('  1. Ensure backend is running: npm run dev');
    console.error('  2. Verify backend IP/port matches in .env file');
    console.error('  3. Check firewall allows connections to port 5000');
    console.error('  4. Verify mobile device is on the same network');
    console.error('  5. Try pinging the backend from terminal');
    
    return false;
  }
}

export async function getNetworkInfo() {
  console.log('📊 Network Information:');
  console.log(`  API Base URL: ${API_BASE_URL}`);
  
  try {
    // Attempt to extract host and port
    const url = new URL(API_BASE_URL);
    console.log(`  Protocol: ${url.protocol}`);
    console.log(`  Host: ${url.hostname}`);
    console.log(`  Port: ${url.port || 'default'}`);
  } catch (error) {
    console.error('  ⚠️ Could not parse API_BASE_URL');
  }
}
