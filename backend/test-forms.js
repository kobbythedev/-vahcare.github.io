#!/usr/bin/env node

/**
 * Form Submission Test Script
 * Tests both contact form and job application form endpoints
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 VAH Care - Form Submission Test Suite');
console.log('=' .repeat(50));

async function testContactForm() {
  console.log('\n📧 Testing Contact Form...');
  
  try {
    const response = await axios.post(`${BASE_URL}/contact`, {
      name: 'Test User',
      email: 'test@example.com',
      phone: '07123456789',
      service: 'home_care',
      message: 'This is a test message from the automated test suite.'
    });
    
    if (response.data.success) {
      console.log('✅ Contact form submission successful');
      console.log(`   Contact ID: ${response.data.data.contactId}`);
      console.log(`   Message: ${response.data.message}`);
      return true;
    } else {
      console.log('❌ Contact form submission failed');
      console.log(`   Error: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Contact form submission error');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testJobApplication() {
  console.log('\n💼 Testing Job Application...');
  
  // Create a test PDF file
  const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test CV Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000207 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
303
%%EOF`;
  
  fs.writeFileSync('test-cv.pdf', testPdfContent);
  
  try {
    const formData = new FormData();
    formData.append('jobId', '507f1f77bcf86cd799439011');
    formData.append('fullName', 'Test Applicant');
    formData.append('email', 'applicant@example.com');
    formData.append('experience', '3-5');
    formData.append('availability', 'immediately');
    formData.append('message', 'This is a test application from the automated test suite.');
    formData.append('cv', fs.createReadStream('test-cv.pdf'));
    
    const response = await axios.post(`${BASE_URL}/jobs/apply`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    if (response.data.success) {
      console.log('✅ Job application submission successful');
      console.log(`   Application ID: ${response.data.data.applicationId}`);
      console.log(`   Job Title: ${response.data.data.jobTitle}`);
      console.log(`   Message: ${response.data.message}`);
      return true;
    } else {
      console.log('❌ Job application submission failed');
      console.log(`   Error: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Job application submission error');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  } finally {
    // Clean up test file
    if (fs.existsSync('test-cv.pdf')) {
      fs.unlinkSync('test-cv.pdf');
    }
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.data.success) {
      console.log('✅ Health endpoint working');
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Timestamp: ${response.data.timestamp}`);
      return true;
    } else {
      console.log('❌ Health endpoint failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const results = {
    health: await testHealthEndpoint(),
    contact: await testContactForm(),
    jobApplication: await testJobApplication()
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(30));
  console.log(`Health Endpoint: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Contact Form: ${results.contact ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Job Application: ${results.jobApplication ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 Overall Result:');
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED - Forms are working correctly!');
    console.log('\n🚀 Frontend forms should now successfully submit to the backend.');
    console.log('📍 Contact form endpoint: POST /api/contact');
    console.log('📍 Job application endpoint: POST /api/jobs/apply');
  } else {
    console.log('❌ SOME TESTS FAILED - Check the errors above.');
  }
  
  return allPassed;
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error.message);
  process.exit(1);
});
