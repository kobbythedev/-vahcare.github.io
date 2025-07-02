#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Contact = require('../models/Contact');

const viewDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 VAH Care Database Overview\n');
    console.log('=' + '='.repeat(50));
    
    // Jobs
    const jobs = await Job.find().sort({ createdAt: -1 });
    console.log(`\n📋 Jobs (${jobs.length} total):`);
    console.log('-'.repeat(50));
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   📍 Location: ${job.location}`);
      console.log(`   👥 Specialty: ${job.specialty}`);
      console.log(`   💰 Salary: £${job.salary}`);
      console.log(`   📅 Posted: ${job.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
    // Applications
    const applications = await Application.find().populate('jobId').sort({ appliedAt: -1 });
    console.log(`\n📄 Applications (${applications.length} total):`);
    console.log('-'.repeat(50));
    if (applications.length === 0) {
      console.log('   No applications yet');
    } else {
      applications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.fullName} (${app.email})`);
        console.log(`   Job: ${app.jobId ? app.jobId.title : 'Unknown'}`);
        console.log(`   Experience: ${app.experience}`);
        console.log(`   Availability: ${app.availability}`);
        console.log(`   Applied: ${app.appliedAt.toLocaleDateString()}`);
        console.log('');
      });
    }
    
    // Contacts
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    console.log(`\n📞 Contact Submissions (${contacts.length} total):`);
    console.log('-'.repeat(50));
    if (contacts.length === 0) {
      console.log('   No contact submissions yet');
    } else {
      contacts.forEach((contact, index) => {
        console.log(`${index + 1}. ${contact.name} (${contact.email})`);
        console.log(`   Service: ${contact.service.replace('_', ' ').toUpperCase()}`);
        console.log(`   Status: ${contact.status.toUpperCase()}`);
        console.log(`   Message: ${contact.message.substring(0, 100)}${contact.message.length > 100 ? '...' : ''}`);
        console.log(`   Submitted: ${contact.submittedAt.toLocaleDateString()}`);
        console.log('');
      });
    }
    
    console.log('=' + '='.repeat(50));
    console.log('\n✅ Database overview complete!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  viewDatabase();
}

module.exports = viewDatabase;
