
const SPACE_ID = window.CMS_CONFIG.SPACE_ID;
const ACCESS_TOKEN = window.CMS_CONFIG.ACCESS_TOKEN;
const ENVIRONMENT = window.CMS_CONFIG.ENVIRONMENT || 'master';

const client = contentful.createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
  environment: ENVIRONMENT
});

let currentJobId = null; // Track job being applied to

// ========== LOAD JOBS FROM CMS ==========
async function loadJobsFromCMS() {
  try {
    const response = await client.getEntries({ content_type: 'job' });
    const items = response.items;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("No items returned from CMS.");
    }

    const jobs = items
      .map(item => {
        const fields = item.fields || {};
        const title = fields.title || "Untitled";
        const description = fields.description || "No description";
        const salary = fields.salary || "N/A";
        const posted = fields.datePosted || "Recently Posted";
        const type = fields.type || "Full-Time";

        let location = "unknown";
        if (typeof fields.location === "string") {
          location = fields.location.toLowerCase();
        } else if (fields.location?.fields?.name) {
          location = fields.location.fields.name.toLowerCase();
        }

        let specialty = "unspecified";
        if (typeof fields.specialty === "string") {
          specialty = fields.specialty.toLowerCase();
        } else if (fields.specialty?.fields?.name) {
          specialty = fields.specialty.fields.name.toLowerCase();
        }

        const requirements = Array.isArray(fields.requirements)
          ? fields.requirements.map(req => (typeof req === 'string' ? req : ''))
          : [];

        return {
          id: item.sys.id,
          title,
          location,
          specialty,
          description,
          salary,
          type,
          posted,
          requirements
        };
      })
      .filter(Boolean);

    if (jobs.length === 0) throw new Error("No valid jobs returned from CMS.");
    renderJobs(jobs);
  } catch (error) {
    console.error(error);
    useMockJobs(error);
  }
}

// ========== RENDER JOBS ==========
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
    jobCard.dataset.location = job.location;
    jobCard.dataset.specialty = job.specialty;

    jobCard.innerHTML = `
      <div class="job-content">
        <h3>${job.title}</h3>
        <div class="job-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
          <span><i class="fas fa-briefcase"></i> ${job.specialty}</span>
          <span><i class="fas fa-clock"></i> ${job.type}</span>
          <span><i class="fas fa-calendar-alt"></i> ${job.posted}</span>
          <span><i class="fas fa-money-bill"></i> £${job.salary}</span>
        </div>
        <p class="job-description">${job.description}</p>
        ${job.requirements.length > 0 ? `
          <ul class="job-requirements">
            ${job.requirements.map(req => `<li>${req}</li>`).join('')}
          </ul>` : ''}
      </div>

      <button class="apply-btn" data-job-id="${job.id}" data-job-title="${job.title}">
        Apply Now
      </button>
    `;

    container.appendChild(jobCard);
  });

  document.getElementById("loadingState").style.display = "none";
  document.getElementById("noJobsMessage").style.display = "none";

  attachModalEvents(); // attach modal triggers
}

// ========== ATTACH MODAL EVENTS ==========
function attachModalEvents() {
  const buttons = document.querySelectorAll(".apply-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const jobTitle = btn.getAttribute("data-job-title");
      const jobId = btn.getAttribute("data-job-id");
      currentJobId = jobId;
      openModal(jobTitle);
    });
  });
}

function openModal(title) {
  const modal = document.getElementById('applicationModal');
  document.getElementById('modalJobTitle').textContent = title;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// ========== CLOSE MODAL ==========
const modal = document.getElementById('applicationModal');
document.querySelector('.close-modal').addEventListener('click', () => {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
});
window.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
});

// ========== FILTER DROPDOWNS ==========
document.querySelectorAll('.filter-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const dropdown = button.nextElementSibling;
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== dropdown) menu.classList.remove('show');
    });
    dropdown.classList.toggle('show');
  });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.filter-box')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('show');
    });
  }
});

// ========== ACTIVE FILTER DISPLAY ==========
document.querySelectorAll('#locationDropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    document.getElementById('activeLocation').textContent = item.textContent;
    document.getElementById('locationToggle').querySelector('span').textContent = item.textContent;
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    filterJobs();
  });
});

document.querySelectorAll('#specialtyDropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    document.getElementById('activeSpecialty').textContent = item.textContent;
    document.getElementById('specialtyToggle').querySelector('span').textContent = item.textContent;
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    filterJobs();
  });
});

// ========== FILTER JOBS ==========
function filterJobs() {
  const selectedLocation = document.getElementById('activeLocation').textContent.toLowerCase();
  const selectedSpecialty = document.getElementById('activeSpecialty').textContent.toLowerCase();
  const cards = document.querySelectorAll('.job-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardLocation = card.dataset.location;
    const cardSpecialty = card.dataset.specialty;
    const matchesLocation = selectedLocation === 'all locations' || cardLocation.includes(selectedLocation);
    const matchesSpecialty = selectedSpecialty === 'all specialties' || cardSpecialty.includes(selectedSpecialty);

    if (matchesLocation && matchesSpecialty) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const noJobsMessage = document.getElementById('noJobsMessage');
  noJobsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
}

// ========== FILE NAME PREVIEW ==========
document.getElementById('cvUpload').addEventListener('change', function () {
  const fileName = this.files[0]?.name || 'Choose file';
  document.getElementById('cvFileName').textContent = fileName;
});

// ========== FORM SUBMISSION ==========
document.getElementById('jobApplicationForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const submitBtn = document.querySelector('.submit-btn');
  const submitText = document.querySelector('.submit-text');
  const submitSpinner = document.querySelector('.submit-spinner');

  const name = document.getElementById('applicantName').value.trim();
  const email = document.getElementById('applicantEmail').value.trim();
  const experience = document.getElementById('applicantExperience').value;
  const availability = document.getElementById('applicantAvailability').value;
  const cv = document.getElementById('cvUpload').files[0];
  const message = document.getElementById('applicantMessage').value.trim();

  if (!name || !email || !experience || !availability || !cv) {
    showToast("Please complete all required fields", "error");
    return;
  }

  submitBtn.disabled = true;
  if (submitText) submitText.style.display = 'none';
  if (submitSpinner) submitSpinner.style.display = 'flex';

  try {
    const formData = new FormData();
    formData.append('jobId', currentJobId);
    formData.append('fullName', name);
    formData.append('email', email);
    formData.append('experience', experience);
    formData.append('availability', availability);
    formData.append('message', message);
    formData.append('cv', cv);

    await submitApplication(formData);
    showToast("Application submitted successfully!", "success");

    this.reset();
    document.getElementById('cvFileName').textContent = 'Choose file';
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  } catch (error) {
    console.error('Application submission failed:', error);
    showToast("Failed to submit application. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    if (submitText) submitText.style.display = 'inline';
    if (submitSpinner) submitSpinner.style.display = 'none';
  }
});

// ========== SUBMIT APPLICATION TO BACKEND ==========
async function submitApplication(formData) {
  // For development, determine the base URL
  const baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : '';

  const response = await fetch(`${baseURL}/api/jobs/apply`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || 'Failed to submit application');
  }

  return await response.json();
}

// ========== TOAST ==========
function showToast(message, type = "success") {
  document.querySelectorAll('.toast').forEach(toast => toast.remove());

  const toast = document.createElement("div");
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.textContent = message;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ========== ON LOAD ==========
document.addEventListener("DOMContentLoaded", async () => {
  await loadJobsFromCMS();
  filterJobs();
});
