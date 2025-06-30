// ========== CMS INTEGRATION & JOB LOADING ==========
let allJobs = [];
let currentJobId = null;

// Initialize the app when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  await loadJobsFromCMS();
  hideLoading();
  renderJobs();
});

// Load jobs from CMS or fallback to mock data
async function loadJobsFromCMS() {
  try {
    // Check if CMS configuration exists
    if (!window.CMS_CONFIG || !window.CMS_CONFIG.SPACE_ID) {
      console.warn('CMS not configured, using mock data');
      allJobs = getMockJobs();
      return;
    }

    // Fetch from Contentful CMS
    const response = await fetch(
      `https://cdn.contentful.com/spaces/${window.CMS_CONFIG.SPACE_ID}/environments/${window.CMS_CONFIG.ENVIRONMENT}/entries?content_type=job&access_token=${window.CMS_CONFIG.ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch jobs from CMS');
    }

    const data = await response.json();
    allJobs = formatCMSJobs(data);
    console.log('Jobs loaded successfully from CMS');
  } catch (error) {
    console.warn('CMS loading failed, using mock data:', error);
    allJobs = getMockJobs();
  }
}

// Format CMS data to standard format
function formatCMSJobs(cmsData) {
  return cmsData.items.map(item => ({
    id: item.sys.id,
    title: item.fields.title,
    location: item.fields.location?.toLowerCase() || 'england',
    specialty: item.fields.specialty?.toLowerCase().replace(/\s+/g, '-') || 'health-assistant',
    description: item.fields.description,
    salary: item.fields.salary || 'Competitive',
    type: item.fields.type || 'Full-time',
    posted: item.fields.postedDate || new Date().toISOString().split('T')[0],
    requirements: item.fields.requirements || []
  }));
}

// Mock data for fallback
function getMockJobs() {
  return [
    {
      id: '1',
      title: 'Senior Health Assistant',
      location: 'england',
      specialty: 'health-assistant',
      description: 'We are seeking a dedicated Senior Health Assistant to join our dynamic healthcare team. You will provide essential support to medical professionals while ensuring excellent patient care standards.',
      salary: '£28,000 - £32,000',
      type: 'Full-time',
      posted: '2025-06-25',
      requirements: ['NVQ Level 2 in Health & Social Care', '2+ years experience', 'Excellent communication skills']
    },
    {
      id: '2',
      title: 'Registered Mental Health Nurse',
      location: 'wales',
      specialty: 'nurse',
      description: 'Join our compassionate mental health team as a Registered Mental Health Nurse. You will provide specialized care to patients with mental health conditions in a supportive environment.',
      salary: '£35,000 - £42,000',
      type: 'Full-time',
      posted: '2025-06-24',
      requirements: ['RMN qualification', 'NMC registration', 'Experience in mental health settings']
    },
    {
      id: '3',
      title: 'Kitchen Assistant',
      location: 'england',
      specialty: 'kitchen',
      description: 'We are looking for a reliable Kitchen Assistant to support our catering team in providing nutritious meals for patients and staff in our healthcare facility.',
      salary: '£20,000 - £24,000',
      type: 'Part-time',
      posted: '2025-06-23',
      requirements: ['Food hygiene certificate', 'Previous kitchen experience preferred', 'Team player attitude']
    },
    {
      id: '4',
      title: 'Housekeeper - Healthcare Facility',
      location: 'england',
      specialty: 'housekeeping',
      description: 'Maintain the highest standards of cleanliness and hygiene in our healthcare facility. You will play a crucial role in infection control and patient safety.',
      salary: '£19,000 - £22,000',
      type: 'Full-time',
      posted: '2025-06-22',
      requirements: ['Experience in healthcare cleaning', 'Knowledge of infection control', 'Attention to detail']
    },
    {
      id: '5',
      title: 'Registered General Nurse',
      location: 'wales',
      specialty: 'nurse',
      description: 'We have an exciting opportunity for a Registered General Nurse to join our medical ward team. You will provide comprehensive nursing care to patients across various medical conditions.',
      salary: '£32,000 - £38,000',
      type: 'Full-time',
      posted: '2025-06-21',
      requirements: ['RGN qualification', 'NMC registration', 'Minimum 1 year experience']
    },
    {
      id: '6',
      title: 'Health Assistant - Community Care',
      location: 'wales',
      specialty: 'health-assistant',
      description: 'Support our community healthcare team by providing essential care services to patients in their homes and community settings.',
      salary: '£24,000 - £28,000',
      type: 'Full-time',
      posted: '2025-06-20',
      requirements: ['Care certificate', 'Driving license', 'Compassionate nature']
    }
  ];
}

// Render jobs to the page
function renderJobs() {
  const container = document.getElementById('jobsContainer');
  const noJobsMessage = document.getElementById('noJobsMessage');

  if (allJobs.length === 0) {
    container.innerHTML = '';
    noJobsMessage.style.display = 'block';
    return;
  }

  noJobsMessage.style.display = 'none';

  container.innerHTML = allJobs.map((job, index) => `
    <div class="job-card"
         data-location="${job.location}"
         data-specialty="${job.specialty}"
         style="animation-delay: ${index * 0.1}s">
      <div class="job-content">
        <h3>${job.title}</h3>
        <div class="job-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${formatLocation(job.location)}</span>
          <span><i class="fas fa-briefcase"></i> ${job.type}</span>
          <span><i class="fas fa-pound-sign"></i> ${job.salary}</span>
          <span><i class="fas fa-calendar"></i> Posted ${formatDate(job.posted)}</span>
        </div>
        <p class="job-description">${job.description}</p>
      </div>
      <button class="apply-btn" data-job="${job.title}" data-job-id="${job.id}">
        Apply Now
      </button>
    </div>
  `).join('');

  // Re-attach event listeners for new buttons
  attachApplyButtonListeners();
}

// Utility functions
function formatLocation(location) {
  return location.charAt(0).toUpperCase() + location.slice(1);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'today';
  if (diffDays === 2) return 'yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('jobsContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('jobsContainer').style.display = 'block';
}

// Attach event listeners to apply buttons
function attachApplyButtonListeners() {
  document.querySelectorAll('.apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const jobTitle = btn.dataset.job;
      const jobId = btn.dataset.jobId;
      currentJobId = jobId;
      modalTitle.textContent = `Apply for ${jobTitle}`;
      document.getElementById('jobId').value = jobId;
      modal.classList.add('show');
    });
  });
}

// ========== FILTER DROPDOWN LOGIC ==========
document.querySelectorAll('.filter-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const dropdown = button.nextElementSibling;

    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== dropdown) {
        menu.classList.remove('show');
      }
    });

    dropdown.classList.toggle('show');
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.filter-box')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('show');
    });
  }
});

// ========== ACTIVE FILTER DISPLAY ==========
const locationItems = document.querySelectorAll('#locationDropdown .dropdown-item');
const specialtyItems = document.querySelectorAll('#specialtyDropdown .dropdown-item');

locationItems.forEach(item => {
  item.addEventListener('click', () => {
    document.getElementById('activeLocation').textContent = item.textContent;
    document.getElementById('locationToggle').querySelector('span').textContent = item.textContent;
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    filterJobs();
  });
});

specialtyItems.forEach(item => {
  item.addEventListener('click', () => {
    document.getElementById('activeSpecialty').textContent = item.textContent;
    document.getElementById('specialtyToggle').querySelector('span').textContent = item.textContent;
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    filterJobs();
  });
});

// ========== JOB FILTERING FUNCTION ==========
function filterJobs() {
  const selectedLocation = document.getElementById('activeLocation').textContent.toLowerCase();
  const selectedSpecialty = document.getElementById('activeSpecialty').textContent.toLowerCase();
  const cards = document.querySelectorAll('.job-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardLocation = card.dataset.location.toLowerCase();
    const cardSpecialty = card.dataset.specialty.toLowerCase();
    const matchesLocation = selectedLocation === 'all locations' || cardLocation.includes(selectedLocation);
    const matchesSpecialty = selectedSpecialty === 'all specialties' || cardSpecialty.includes(selectedSpecialty);

    if (matchesLocation && matchesSpecialty) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Show/hide no jobs message
  const noJobsMessage = document.getElementById('noJobsMessage');
  if (visibleCount === 0) {
    noJobsMessage.style.display = 'block';
  } else {
    noJobsMessage.style.display = 'none';
  }
}

// ========== MODAL OPEN/CLOSE ==========
const modal = document.getElementById('applicationModal');
const modalTitle = document.getElementById('modalJobTitle');
const closeBtn = document.querySelector('.close-modal');

closeBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
});

// ========== FILE NAME PREVIEW ==========
document.getElementById('cvUpload').addEventListener('change', function () {
  const fileName = this.files[0]?.name || 'Choose file';
  document.getElementById('cvFileName').textContent = fileName;
});

// ========== FORM VALIDATION + SUBMISSION ==========
document.getElementById('jobApplicationForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const submitBtn = document.querySelector('.submit-btn');
  const submitText = document.querySelector('.submit-text');
  const submitSpinner = document.querySelector('.submit-spinner');

  // Grab all required fields
  const name = document.getElementById('applicantName').value.trim();
  const email = document.getElementById('applicantEmail').value.trim();
  const experience = document.getElementById('applicantExperience').value;
  const availability = document.getElementById('applicantAvailability').value;
  const cv = document.getElementById('cvUpload').files[0];
  const message = document.getElementById('applicantMessage').value.trim();

  // Validate
  if (!name || !email || !experience || !availability || !cv) {
    showToast("Please complete all required fields", "error");
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  if (submitText) submitText.style.display = 'none';
  if (submitSpinner) submitSpinner.style.display = 'flex';

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('jobId', currentJobId);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('experience', experience);
    formData.append('availability', availability);
    formData.append('message', message);
    formData.append('cv', cv);

    // Submit application (replace with your actual endpoint)
    await submitApplication(formData);

    showToast("Application submitted successfully!", "success");

    // Clear form and close modal
    this.reset();
    document.getElementById('cvFileName').textContent = 'Choose file';
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';

  } catch (error) {
    console.error('Application submission failed:', error);
    showToast("Failed to submit application. Please try again.", "error");
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    if (submitText) submitText.style.display = 'inline';
    if (submitSpinner) submitSpinner.style.display = 'none';
  }
});

// Submit application function (replace with your actual API endpoint)
async function submitApplication(formData) {
  // Simulate API call - replace with your actual endpoint
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate random success/failure for demo
      if (Math.random() > 0.1) {
        resolve({ success: true });
      } else {
        reject(new Error('Submission failed'));
      }
    }, 2000);
  });
}

// ========== TOAST SYSTEM ==========
function showToast(message, type = "success") {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(toast => toast.remove());

  const toast = document.createElement("div");
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ========== UTILITY FUNCTIONS ==========
// Function to refresh jobs (useful for CMS updates)
async function refreshJobs() {
  showLoading();
  try {
    await loadJobsFromCMS();
    renderJobs();
    showToast('Jobs refreshed successfully!');
  } catch (error) {
    showToast('Failed to refresh jobs.', 'error');
  } finally {
    hideLoading();
  }
}

// Export functions for global access
window.refreshJobs = refreshJobs;
