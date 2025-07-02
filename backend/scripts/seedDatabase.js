const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../models/Job');
const connectDB = require('../config/database');

// Sample jobs data
const jobs = [
  {
    title: 'Registered Nurse - Care Home',
    location: 'England',
    specialty: 'Registered Nurse',
    description: 'We are seeking a compassionate and skilled Registered Nurse to join our team at a well-established care home in England. The successful candidate will provide high-quality nursing care to our residents, ensuring their comfort, dignity, and well-being. You will work closely with our multidisciplinary team to develop and implement care plans, administer medications, and support families during their loved ones\' care journey.',
    salary: '30,000 - 35,000'
  },
  {
    title: 'Health Care Assistant - Dementia Care',
    location: 'Wales',
    specialty: 'Health Assistant',
    description: 'Join our dedicated team as a Health Care Assistant specializing in dementia care. This rewarding role involves providing person-centered care to residents with dementia and Alzheimer\'s disease. You will assist with daily living activities, provide emotional support, and help maintain a safe and stimulating environment. Experience in dementia care is preferred but full training will be provided.',
    salary: '22,000 - 25,000'
  },
  {
    title: 'Kitchen Assistant - Nutritional Care',
    location: 'England',
    specialty: 'Kitchen Assistant',
    description: 'We are looking for a reliable Kitchen Assistant to join our nutrition team. You will be responsible for meal preparation, maintaining food safety standards, and ensuring our residents receive nutritious and appetizing meals. The role includes working with dietary requirements, allergen management, and supporting our head chef in daily kitchen operations.',
    salary: '20,000 - 23,000'
  },
  {
    title: 'House Keeper - Infection Control Specialist',
    location: 'Wales',
    specialty: 'House Keeper',
    description: 'An opportunity for a dedicated House Keeper with focus on infection control and prevention. You will maintain the highest standards of cleanliness and hygiene throughout our care facility. Responsibilities include deep cleaning, laundry management, and ensuring compliance with health and safety regulations. Previous experience in healthcare cleaning is advantageous.',
    salary: '19,000 - 22,000'
  },
  {
    title: 'Senior Registered Nurse - Night Shift',
    location: 'England',
    specialty: 'Registered Nurse',
    description: 'Experienced Registered Nurse required for our night shift team. This senior position involves overseeing the night-time care of residents, managing a small team of healthcare assistants, and ensuring continuity of care during overnight hours. The role requires excellent clinical skills, leadership abilities, and the capacity to handle emergency situations.',
    salary: '32,000 - 38,000'
  },
  {
    title: 'Health Care Assistant - Rehabilitation Support',
    location: 'England',
    specialty: 'Health Assistant',
    description: 'Join our rehabilitation team as a Health Care Assistant supporting residents in their recovery journey. You will work alongside physiotherapists and occupational therapists to help residents regain independence and improve their quality of life. This role involves mobility assistance, therapeutic activities, and providing encouragement throughout the rehabilitation process.',
    salary: '23,000 - 26,000'
  },
  {
    title: 'Kitchen Assistant - Special Diets',
    location: 'Wales',
    specialty: 'Kitchen Assistant',
    description: 'Specialized Kitchen Assistant position focusing on special dietary requirements including diabetic, pureed, and culturally specific meals. You will work closely with our nutrition team to ensure all residents receive appropriate meals that meet their individual needs while maintaining taste and presentation standards.',
    salary: '21,000 - 24,000'
  },
  {
    title: 'House Keeper - Laundry Specialist',
    location: 'England',
    specialty: 'House Keeper',
    description: 'House Keeper role specializing in laundry and textile care for our residential facility. Responsibilities include managing the laundry operation, maintaining infection control protocols, and ensuring residents\' personal clothing and facility linens are properly cared for. Attention to detail and understanding of fabric care is essential.',
    salary: '20,000 - 23,000'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing jobs
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing jobs');
    
    // Insert sample jobs
    const createdJobs = await Job.insertMany(jobs);
    console.log(`✅ Successfully seeded ${createdJobs.length} jobs`);
    
    console.log('\n📋 Seeded Jobs:');
    createdJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - ${job.location} (${job.specialty})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
