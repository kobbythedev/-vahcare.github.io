const request = require('supertest');
const app = require('../../server');
const path = require('path');
const fs = require('fs');

let testFilePaths = [];

// Create test files
beforeAll(() => {
  const fixturesDir = path.join(__dirname, '../fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
  
  // Create valid PDF file
  const validPdfPath = path.join(fixturesDir, 'valid-cv.pdf');
  fs.writeFileSync(validPdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n'));
  testFilePaths.push(validPdfPath);
  
  // Create valid DOC file
  const validDocPath = path.join(fixturesDir, 'valid-cv.doc');
  fs.writeFileSync(validDocPath, Buffer.from('Valid Word document content'));
  testFilePaths.push(validDocPath);
  
  // Create invalid file type
  const invalidFilePath = path.join(fixturesDir, 'invalid-file.txt');
  fs.writeFileSync(invalidFilePath, 'This is a text file');
  testFilePaths.push(invalidFilePath);
  
  // Create large file (for size limit testing)
  const largeFilePath = path.join(fixturesDir, 'large-file.pdf');
  const largeContent = Buffer.alloc(11 * 1024 * 1024, 'a'); // 11MB file
  fs.writeFileSync(largeFilePath, largeContent);
  testFilePaths.push(largeFilePath);
});

// Clean up test files
afterAll(() => {
  testFilePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
  
  // Remove fixtures directory if empty
  const fixturesDir = path.join(__dirname, '../fixtures');
  if (fs.existsSync(fixturesDir)) {
    try {
      fs.rmdirSync(fixturesDir);
    } catch (err) {
      // Directory not empty, leave it
    }
  }
});

describe('File Upload Validation', () => {
  const testJobData = {
    title: 'Test Job for File Upload',
    location: 'England',
    specialty: 'Registered Nurse',
    description: 'A test job for file upload validation.',
    salary: '25,000 - 30,000'
  };
  
  const testApplicationData = {
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    experience: '1-3',
    availability: 'immediately'
  };
  
  let testJobId;
  
  beforeEach(async () => {
    // Create a test job for file uploads
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
  
  describe('CV File Upload', () => {
    it('should accept valid PDF files', async () => {
      const validPdfPath = testFilePaths[0];
      
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', testJobId)
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .attach('cv', validPdfPath)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Application submitted successfully');
    });
    
    it('should accept valid DOC files', async () => {
      const validDocPath = testFilePaths[1];
      
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', testJobId)
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .attach('cv', validDocPath)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Application submitted successfully');
    });
    
    it('should reject invalid file types', async () => {
      const invalidFilePath = testFilePaths[2];
      
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', testJobId)
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .attach('cv', invalidFilePath)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Only PDF and Word documents are allowed for CV upload.');
    });
    
    it('should reject files larger than 10MB', async () => {
      const largeFilePath = testFilePaths[3];
      
      const response = await request(app)
        .post('/api/jobs/apply')
        .field('jobId', testJobId)
        .field('fullName', testApplicationData.fullName)
        .field('email', testApplicationData.email)
        .field('experience', testApplicationData.experience)
        .field('availability', testApplicationData.availability)
        .attach('cv', largeFilePath)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('File too large. Maximum size is 10MB.');
    });
    
    it('should require CV file for job applications', async () => {
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
  });
});
