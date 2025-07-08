const SPACE_ID = window.CMS_CONFIG.SPACE_ID;
const ACCESS_TOKEN = window.CMS_CONFIG.ACCESS_TOKEN;
const ENVIRONMENT = window.CMS_CONFIG.ENVIRONMENT || "master";

let client = null;
let currentJobId = null;

if (SPACE_ID && ACCESS_TOKEN) {
  client = contentful.createClient({
    space: SPACE_ID,
    accessToken: ACCESS_TOKEN,
    environment: ENVIRONMENT,
  });
}

// ========== LOAD JOBS ==========
const loadJobsFromCMS = async () => {
  try {
    if (!client) throw new Error("CMS credentials missing");

    const { items } = await client.getEntries({ content_type: "job" });
    if (!Array.isArray(items) || items.length === 0)
      throw new Error("No jobs in CMS");

    const jobs = items
      .map((item) => {
        const fields = item.fields || {};

        return {
          id: item.sys.id,
          title: fields.title || "Untitled",
          location:
            typeof fields.location === "string"
              ? fields.location.toLowerCase()
              : fields.location?.fields?.name?.toLowerCase() || "unknown",
          specialty:
            typeof fields.specialty === "string"
              ? fields.specialty.toLowerCase()
              : fields.specialty?.fields?.name?.toLowerCase() || "unspecified",
          description: fields.description || "No description provided.",
          salary: fields.salary || "N/A",
          posted: fields.datePosted || "Recently Posted",
          type: fields.type || "Full-Time",
          requirements: Array.isArray(fields.requirements)
            ? fields.requirements.map((r) => r || "")
            : [],
        };
      })
      .filter(Boolean);

    if (!jobs.length) throw new Error("No valid jobs");

    renderJobs(jobs);
  } catch (err) {
    console.error("CMS Error:", err);
    useMockJobs(err);
  }
};

// ========== MOCK JOBS ==========
const useMockJobs = (err) => {
  console.warn("Using mock jobs due to:", err.message);

  const mockJobs = [
    {
      id: "mock-1",
      title: "Registered Nurse - Care Home",
      location: "england",
      specialty: "nurse",
      description: "Join our care home as a Registered Nurse.",
      salary: "30,000 - 35,000",
      type: "Full-Time",
      posted: "Recently Posted",
      requirements: [
        "Nursing qualification",
        "2+ yrs exp",
        "Strong communication",
      ],
    },
    {
      id: "mock-2",
      title: "Kitchen Assistant",
      location: "wales",
      specialty: "kitchen",
      description: "Assist in kitchen and nutrition tasks.",
      salary: "20,000 - 23,000",
      type: "Full-Time",
      posted: "Recently Posted",
      requirements: ["Food hygiene", "Attention to detail"],
    },
  ];

  renderJobs(mockJobs);
};

// ========== RENDER ==========
const renderJobs = (jobs) => {
  const container = document.getElementById("jobsContainer");
  container.innerHTML = "";

  if (!jobs.length) {
    document.getElementById("noJobsMessage").style.display = "block";
    return;
  }

  jobs.forEach((job) => {
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
        ${job.requirements.length ? `<ul class="job-requirements">${job.requirements.map((r) => `<li>${r}</li>`).join("")}</ul>` : ""}
      </div>
      <button class="apply-btn" data-job-id="${job.id}" data-job-title="${job.title}">Apply Now</button>
    `;

    container.appendChild(jobCard);
  });

  document.getElementById("loadingState").style.display = "none";
  document.getElementById("noJobsMessage").style.display = "none";

  attachModalEvents();
};

// ========== EVENTS ==========
const attachModalEvents = () => {
  document.querySelectorAll(".apply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentJobId = btn.dataset.jobId;
      document.getElementById("modalJobTitle").textContent =
        btn.dataset.jobTitle;
      document.getElementById("applicationModal").classList.add("show");
      document.body.style.overflow = "hidden";
    });
  });
};

document.querySelector(".close-modal").addEventListener("click", () => {
  document.getElementById("applicationModal").classList.remove("show");
  document.body.style.overflow = "auto";
});

window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("applicationModal")) {
    document.getElementById("applicationModal").classList.remove("show");
    document.body.style.overflow = "auto";
  }
});

// ========== FILTERS ==========
document.querySelectorAll(".filter-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dropdown = btn.nextElementSibling;
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      if (menu !== dropdown) menu.classList.remove("show");
    });
    dropdown.classList.toggle("show");
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".filter-box")) {
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((menu) => menu.classList.remove("show"));
  }
});

["location", "specialty"].forEach((type) => {
  document
    .querySelectorAll(`#${type}Dropdown .dropdown-item`)
    .forEach((item) => {
      item.addEventListener("click", () => {
        document.getElementById(`active${capitalize(type)}`).textContent =
          item.textContent;
        document
          .getElementById(`${type}Toggle`)
          .querySelector("span").textContent = item.textContent;
        document
          .querySelectorAll(".dropdown-menu")
          .forEach((menu) => menu.classList.remove("show"));
        filterJobs();
      });
    });
});

const filterJobs = () => {
  const selectedLocation = document
    .getElementById("activeLocation")
    .textContent.toLowerCase();
  const selectedSpecialty = document
    .getElementById("activeSpecialty")
    .textContent.toLowerCase();
  const cards = document.querySelectorAll(".job-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchLocation =
      selectedLocation === "all locations" ||
      card.dataset.location.includes(selectedLocation);
    const matchSpecialty =
      selectedSpecialty === "all specialties" ||
      card.dataset.specialty.includes(selectedSpecialty);
    const show = matchLocation && matchSpecialty;

    card.style.display = show ? "flex" : "none";
    if (show) visibleCount++;
  });

  document.getElementById("noJobsMessage").style.display = visibleCount
    ? "none"
    : "block";
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", async () => {
  await loadJobsFromCMS();
  filterJobs();
});
