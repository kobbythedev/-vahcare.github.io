// Mock data for testing without MongoDB
const mockJobs = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Registered Nurse - Care Home',
    location: 'England',
    specialty: 'Registered Nurse',
    description: 'We are seeking a compassionate and skilled Registered Nurse to join our team at a well-established care home in England.',
    salary: '30,000 - 35,000',
    createdAt: new Date('2024-01-15')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Health Care Assistant - Dementia Care',
    location: 'Wales',
    specialty: 'Health Assistant',
    description: 'Join our dedicated team as a Health Care Assistant specializing in dementia care.',
    salary: '22,000 - 25,000',
    createdAt: new Date('2024-01-10')
  },
  {
    _id: '507f1f77bcf86cd799439013',
    title: 'Kitchen Assistant - Nutritional Care',
    location: 'England',
    specialty: 'Kitchen Assistant',
    description: 'We are looking for a reliable Kitchen Assistant to join our nutrition team.',
    salary: '20,000 - 23,000',
    createdAt: new Date('2024-01-08')
  }
];

const mockApplications = [];
const mockContacts = [];

module.exports = {
  mockJobs,
  mockApplications,
  mockContacts
};
