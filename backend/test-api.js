const http = require('http');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

// Test contact form submission
const testContactForm = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      service: 'home_care',
      message: 'This is a test message'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/contact',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('✅ Contact Form Test:', res.statusCode, JSON.parse(data));
        resolve();
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Test 404 route
const test404Route = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/nonexistent',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('✅ 404 Route Test:', res.statusCode, JSON.parse(data));
        resolve();
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Test invalid email validation
const testInvalidEmail = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      fullName: 'Test User',
      email: 'invalid-email',
      message: 'This is a test message'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/contact',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('✅ Invalid Email Test:', res.statusCode, JSON.parse(data));
        resolve();
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Run all tests
const runTests = async () => {
  try {
    console.log('🧪 Starting API Tests...\n');
    
    await testContactForm();
    await test404Route();
    await testInvalidEmail();
    
    console.log('\n✅ All API tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Check if server is running before testing
const checkServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('🚀 Server is running, starting tests...\n');
    runTests();
  });

  req.on('error', (error) => {
    console.error('❌ Server is not running. Please start the server first.');
    process.exit(1);
  });

  req.end();
};

checkServer();
