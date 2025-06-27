// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
  // ==============
  // Navigation
  // ==============
  const navbar = document.getElementById('navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  // Scroll effect for navbar
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    menuToggle.innerHTML = navLinks.classList.contains('active') ? 
      '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
      
      // Smooth scroll to target
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
      
      // Update URL without page reload
      history.pushState(null, null, targetId);
    });
  });

  // ==============
  // Form Handling
  // ==============
  const contactForm = document.getElementById('vahcareForm');
  const loadingSpinner = document.querySelector('.loading-spinner');
  const successModal = document.querySelector('.success-modal');
  const modalMessage = document.querySelector('.modal-message');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Show loading spinner
      loadingSpinner.style.display = 'flex';
      
      // Validate form
      const errors = validateForm();
      if (errors.length > 0) {
        showFormErrors(errors);
        loadingSpinner.style.display = 'none';
        return;
      }
      
      // Simulate form submission (replace with actual fetch in production)
      try {
        const formData = getFormData();
        await simulateSubmission(formData);
        
        // Show success modal
        showSuccessModal(formData.service);
        
        // Reset form
        contactForm.reset();
      } catch (error) {
        showFormErrors(['Submission failed. Please try again later.']);
      } finally {
        loadingSpinner.style.display = 'none';
      }
    });
  }
  
  // Modal close handlers
  document.querySelectorAll('.close-modal, .modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      successModal.style.display = 'none';
    });
  });

  // Close modal when clicking outside
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.style.display = 'none';
    }
  });

  // ==============
  // Animations
  // ==============
  // Animate elements when they come into view
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.service-card, .category-card, .step');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (elementPosition < screenPosition) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  };

  // Set initial state for animated elements
  document.querySelectorAll('.service-card, .category-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
  });

  // Run on load and scroll
  window.addEventListener('load', animateOnScroll);
  window.addEventListener('scroll', animateOnScroll);

  // ==============
  // Helper Functions
  // ==============
  function validateForm() {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Required fields
    if (!contactForm.name.value.trim()) errors.push('Name is required');
    if (!contactForm.email.value.trim()) {
      errors.push('Email is required');
    } else if (!emailRegex.test(contactForm.email.value)) {
      errors.push('Please enter a valid email address');
    }
    if (!contactForm.service.value) errors.push('Please select a service type');
    if (!contactForm.message.value.trim()) errors.push('Message is required');
    
    return errors;
  }
  
  function showFormErrors(errors) {
    // Remove existing errors
    const existingErrors = document.querySelector('.error-message');
    if (existingErrors) existingErrors.remove();
    
    // Create error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
      <h4>Please fix these errors:</h4>
      <ul>
        ${errors.map(error => `<li>${error}</li>`).join('')}
      </ul>
    `;
    
    // Insert before form
    contactForm.prepend(errorContainer);
    
    // Scroll to errors
    window.scrollTo({
      top: errorContainer.offsetTop - 100,
      behavior: 'smooth'
    });
  }
  
  function getFormData() {
    return {
      name: contactForm.name.value.trim(),
      email: contactForm.email.value.trim(),
      phone: contactForm.phone.value.trim(),
      service: contactForm.service.value,
      message: contactForm.message.value.trim()
    };
  }
  
  function simulateSubmission(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form submitted:', data);
        resolve();
      }, 1500); // Simulate network delay
    });
    
    /* Production version would use:
    return fetch('/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    */
  }
  
  function showSuccessModal(serviceType) {
    const serviceNames = {
      'home_care': 'Home Care',
      'specialized_service': 'Specialized Service',
      'staff_recruitment': 'Staff Recruitment',
      'other_enquiry': 'General Inquiry'
    };
    
    modalMessage.textContent = 
      `Thank you for your ${serviceNames[serviceType] || ''} inquiry! ` +
      `Our team will contact you within 24 hours.`;
    
    successModal.style.display = 'flex';
  }

  // Initialize any tooltips or popovers
  initializeTooltips();
});

function initializeTooltips() {
  // Can be expanded with actual tooltip library initialization
  console.log('Tooltips initialized');
}
/* General Styles */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
}

nav {
    background: #333;
    padding: 1rem;
}

nav ul {
    list-style: none;
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0;
}

nav a {
    color: white;
    text-decoration: none;
}

/* Jobs Page Styles */
.jobs-container {
    padding: 2rem;
}

.filter-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.tab-button {
    padding: 0.5rem 1rem;
    background: #ddd;
    border: none;
    cursor: pointer;
}

.tab-button.active {
    background: #333;
    color: white;
}

.jobs-list {
    display: grid;
    gap: 1rem;
}

.cv-form {
    margin-top: 2rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.cv-form input, .cv-form button {
    display: block;
    margin: 0.5rem 0;
    padding: 0.5rem;
    width: 100%;
    max-width: 400px;
}
// Fetch jobs
fetch('http://localhost:5000/jobs')
  .then(res => res.json())
  .then(jobs => console.log(jobs));

// Submit application
const formData = new FormData();
formData.append('cv', cvFile); // From file input
formData.append('name', 'John Doe');
// Add other fields...

fetch('http://localhost:5000/apply', {
  method: 'POST',
  body: formData
});