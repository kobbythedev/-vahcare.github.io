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
  const contactForm = document.querySelector('form');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Get form elements
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      // Validate form
      const errors = validateForm();
      if (errors.length > 0) {
        showFormErrors(errors);
        resetButton();
        return;
      }

      try {
        const formData = getFormData();
        await submitContactForm(formData);

        // Show success message
        showSuccessToast('Thank you for your message! We will contact you soon.');

        // Reset form
        contactForm.reset();
      } catch (error) {
        console.error('Contact form submission error:', error);
        showErrorToast('Failed to send message. Please try again later.');
      } finally {
        resetButton();
      }
      
      function resetButton() {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  // Modal references for legacy support (if needed)
  const successModal = document.querySelector('.success-modal');
  const modalMessage = document.querySelector('.modal-message');

  if (successModal) {
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
  }

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

  // Submit contact form to backend
  async function submitContactForm(data) {
    // For development, determine the base URL
    const baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000' 
      : '';

    const response = await fetch(`${baseURL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit contact form');
    }

    return await response.json();
  }

  // Show success toast notification
  function showSuccessToast(message) {
    showToast(message, 'success');
  }

  // Show error toast notification
  function showErrorToast(message) {
    showToast(message, 'error');
  }

  // Generic toast function
  function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;

    // Add styles
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#2a7f62' : '#dc3545'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 300px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 5000);

    // Allow manual close on click
    toast.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    });
  }

  function showSuccessModal(serviceType) {
    if (!modalMessage || !successModal) return;
    
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
  console.log('VAH Care - Frontend initialized successfully');
}
