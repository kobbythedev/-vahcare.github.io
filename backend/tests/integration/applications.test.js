const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Test data
const testJobData = {
  title: 'Test Nurse Position',
  location: 'England',
  specialty: 'Registered Nurse',
  description: 'A test nursing position for automated testing purposes.',
  salary: '25,000 - 30,000'
};

const testApplicationData = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  experience: '1-3',
  availability: 'immediately',
  message: 'I am very interested in this position.'
};

let testJobId;
let testCvPath;

// Create a test CV file
beforeAll(async () => {
  testCvPath = path.join(__dirname, '../fixtures/test-cv.pdf');
  
  // Create test fixtures directory if it doesn't exist
  const fixturesDir = path.dirname(testCvPath);
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
  
  // Create a dummy PDF file
  fs.writeFileSync(testCvPath, Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n'));
});

// Clean up test files
afterAll(async () => {
  if (fs.existsSync(testCvPath)) {
    fs.unlinkSync(testCvPath);
  }
});

describe('Job Application API', () => {
  beforeEach(async () => {
    // Create a test job
    const jobResponse = await request(app)
      .post('/api/jobs')
      .send(testJobData)
      .expect(201);
    
    testJobId = jobResponse.body.data._id;
  });

  afterEach(async () => {
    // Clean up test job
    if (testJobId) {
      await request(app)
        .delete(`/api/jobs/${testJobId}`)
        .expect(200);
    }
  });

  describe('POST /api/jobs/apply', () => {
    it('should submit a job application successfully', async () => {
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', testJobId)
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .field('message', testApplicationData.message)
        .attach('cv', testCvPath)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Application submitted successfully');
      expect(response.body.data.applicationId).toBeDefined();
      expect(response.body.data.jobTitle).toBe(testJobData.title);
    });

    it('should return 400 if job ID is missing', async () => {
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .attach('cv', testCvPath)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
    });

    it('should return 400 if CV file is missing', async () => {
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', testJobId)
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('CV file is required');
    });

    it('should return 400 if job ID format is invalid', async () => {
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', 'invalid-id')
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .attach('cv', testCvPath)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid job ID format');
    });

    it('should return 404 if job does not exist', async () => {
      const nonExistentJobId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', nonExistentJobId.toString())
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .attach('cv', testCvPath)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Job not found');
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', testJobId)
        .field('fullName', testApplicationData.fullName)
        .field('email', 'invalid-email')
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .attach('cv', testCvPath)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
    });

    it('should return 400 if experience level is invalid', async () => {
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', testJobId)
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', 'invalid-experience')
        .field('availability', testApplicationData.availability)
        .attach('cv', testCvPath)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
    });
  });
});
