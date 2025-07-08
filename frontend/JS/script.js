document.addEventListener("DOMContentLoaded", function () {
  // ========= GLOBAL =========
  const baseURL = "http://localhost:5000";
  const contactForm = document.querySelector("form");

  // ========= NAVIGATION =========
  const navbar = document.getElementById("navbar");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.innerHTML = navLinks.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const target = document.querySelector(targetId);

      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }

      window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
      history.pushState(null, null, targetId);
    });
  });

  // ========= CONTACT FORM =========
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      const errors = validateForm();
      if (errors.length) {
        showFormErrors(errors);
        resetButton();
        return;
      }

      try {
        const formData = getFormData();
        await submitContactForm(formData);
        showToast("Thank you for your message! We’ll contact you shortly.");
        contactForm.reset();
      } catch (err) {
        console.error("Contact form error:", err);
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        resetButton();
      }

      function resetButton() {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  function validateForm() {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const name = contactForm.querySelector('#name').value.trim();
    const email = contactForm.querySelector('#email').value.trim();
    const service = contactForm.querySelector('#service').value;
    const message = contactForm.querySelector('#message').value.trim();

    if (!name) errors.push("Name is required");
    if (!email) {
      errors.push("Email is required");
    } else if (!emailRegex.test(email)) {
      errors.push("Invalid email address");
    }
    if (!service) errors.push("Please select a service type");
    if (!message) errors.push("Message is required");

    return errors;
  }

  function showFormErrors(errors) {
    document.querySelector(".error-message")?.remove();

    const errorContainer = document.createElement("div");
    errorContainer.className = "error-message";
    errorContainer.innerHTML = `
      <h4>Please fix the following:</h4>
      <ul>${errors.map((err) => `<li>${err}</li>`).join("")}</ul>
    `;

    contactForm.prepend(errorContainer);
    window.scrollTo({
      top: errorContainer.offsetTop - 100,
      behavior: "smooth",
    });
  }

  function getFormData() {
    return {
      fullName: contactForm.querySelector('#name').value.trim(),
      email: contactForm.querySelector('#email').value.trim(),
      phone: contactForm.querySelector('#phone').value.trim(),
      service: contactForm.querySelector('#service').value,
      message: contactForm.querySelector('#message').value.trim(),
    };
  }

  async function submitContactForm(data) {
    const res = await fetch(`${baseURL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Form submission failed");
    }

    return await res.json();
  }

  // ========= TOASTS =========
  function showToast(message, type = "success") {
    document.querySelectorAll(".toast").forEach((t) => t.remove());

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
      <span>${message}</span>
    `;

    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${type === "success" ? "#2a7f62" : "#dc3545"};
      color: white; padding: 15px 20px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000; display: flex; gap: 10px;
      font-size: 14px; min-width: 300px;
      opacity: 0; transform: translateX(100%);
      transition: all 0.3s ease;
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
    }, 10);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 5000);

    toast.addEventListener("click", () => toast.remove());
  }

  // ========= ANIMATIONS =========
  const animateOnScroll = () => {
    document
      .querySelectorAll(".service-card, .category-card, .step")
      .forEach((el) => {
        const pos = el.getBoundingClientRect().top;
        const screen = window.innerHeight / 1.2;
        if (pos < screen) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      });
  };

  document
    .querySelectorAll(".service-card, .category-card, .step")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "all 0.6s ease-out";
    });

  window.addEventListener("load", animateOnScroll);
  window.addEventListener("scroll", animateOnScroll);

  // ========= INIT =========
  initializeTooltips();

  function initializeTooltips() {
    console.log("VAH Care - Frontend loaded.");
  }
});
