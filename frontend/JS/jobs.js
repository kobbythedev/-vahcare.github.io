// ========== CMS CONFIG ==========
const SPACE_ID = window.CMS_CONFIG.SPACE_ID;
const ACCESS_TOKEN = window.CMS_CONFIG.ACCESS_TOKEN;
const ENVIRONMENT = window.CMS_CONFIG.ENVIRONMENT || 'master';

const client = contentful.createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
  environment: ENVIRONMENT
});

// Main CMS job loader
async function loadJobsFromCMS() {

  try {
    const client = contentful.createClient({
      space: 'an5z1jbyxt43',
      accessToken: 'ZKGyB6RWFaUfcU0AQYzW98zjHA0x9hbDDMg9H0WFMN4',
    });

    const response = await client.getEntries({ content_type: 'job' });
    const items = response.items;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("No items returned from CMS.");
    }

    const jobs = items
      .map((item, i) => {
        const fields = item.fields || {};
        const title = fields.title || "Untitled";
        const description = fields.description || "No description";
        const salary = fields.salary || "N/A";
        const posted = fields.datePosted || "Recently Posted";
        const type = fields.type || "Full-Time";

        // Handle location
        let location = "unknown";
        if (typeof fields.location === "string") {
          location = fields.location.toLowerCase();
        } else if (
          fields.location?.fields?.name &&
          typeof fields.location.fields.name === "string"
        ) {
          location = fields.location.fields.name.toLowerCase();
        }

        // Handle specialty
        let specialty = "unspecified";
        if (typeof fields.specialty === "string") {
          specialty = fields.specialty.toLowerCase();
        } else if (
          fields.specialty?.fields?.name &&
          typeof fields.specialty.fields.name === "string"
        ) {
          specialty = fields.specialty.fields.name.toLowerCase();
        }

        // Handle requirements
        const requirements = Array.isArray(fields.requirements)
          ? fields.requirements.map(req => (typeof req === 'string' ? req : ''))
          : [];

        return { title, location, specialty, description, salary, type, posted, requirements };
      })
      .filter(Boolean); // Remove nulls

    if (jobs.length === 0) {
      throw new Error("No valid jobs returned from CMS.");
    }

    renderJobs(jobs);
  } catch (error) {
    useMockJobs(error);
  }
}

// Dummy render function (replace with your real one)
function renderJobs(jobs) {
  const container = document.getElementById("jobsContainer");
  container.innerHTML = "";

  if (!jobs.length) {
    document.getElementById("noJobsMessage").style.display = "block";
    return;
  }

  jobs.forEach(job => {
    const jobCard = document.createElement("div");
    jobCard.className = "job-card";
    jobCard.innerHTML = `

      <div class="job-content">
        <h3>${job.title}</h3>
        <div class="job-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
          <span><i class="fas fa-briefcase"></i> ${job.specialty}</span>
          <span><i class="fas fa-clock"></i> ${job.type}</span>
          <span><i class="fas fa-calendar-alt"></i> ${job.posted}</span>
          <span><i class="fas fa-pound-sign"></i> £${job.salary}</span>
        </div>
        <p class="job-description">${job.description}</p>
        ${job.requirements && job.requirements.length > 0 ? `
          <ul class="job-requirements">
            ${job.requirements.map(req => `<li>${req}</li>`).join('')}
          </ul>
        ` : ''}
      </div>

      <button class="apply-btn" data-job="${job.title}">
        Apply Now
      </button>
    `;

    container.appendChild(jobCard);
  });

  document.getElementById("loadingState").style.display = "none";
  document.getElementById("noJobsMessage").style.display = "none";
}

// Run on load
document.addEventListener("DOMContentLoaded", () => {
  loadJobsFromCMS();
});


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
