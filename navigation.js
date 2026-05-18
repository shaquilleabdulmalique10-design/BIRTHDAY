// Navigation functionality
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
  const menu = document.getElementById('mobileMenu');
  const button = event.target.closest('button');
  
  if (menu && !menu.contains(event.target) && !button) {
    menu.classList.add('hidden');
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Data Stats Dashboard
function loadDataStats() {
  const statsContainer = document.getElementById('dataStats');
  if (!statsContainer) return;
  
  try {
    // Get counts from local storage
    const linkHistory = JSON.parse(localStorage.getItem('linkHistory') || '[]');
    const reminders = JSON.parse(localStorage.getItem('birthdayReminders') || '{}');
    const emailReminders = JSON.parse(localStorage.getItem('emailReminders') || '[]');
    const formData = localStorage.getItem('birthdayFormData');
    
    const reminderCount = Object.keys(reminders).length + emailReminders.length;
    
    statsContainer.innerHTML = `
      <div class="luxury-panel p-4 text-center">
        <div class="text-3xl mb-2">🔗</div>
        <p class="text-2xl font-bold" style="color: #FFD700;">${linkHistory.length}</p>
        <p class="text-sm" style="color: rgba(255, 215, 0, 0.7);">Links Created</p>
      </div>
      <div class="luxury-panel p-4 text-center">
        <div class="text-3xl mb-2">🔔</div>
        <p class="text-2xl font-bold" style="color: #FFD700;">${reminderCount}</p>
        <p class="text-sm" style="color: rgba(255, 215, 0, 0.7);">Reminders Set</p>
      </div>
      <div class="luxury-panel p-4 text-center">
        <div class="text-3xl mb-2">📧</div>
        <p class="text-2xl font-bold" style="color: #FFD700;">${emailReminders.length}</p>
        <p class="text-sm" style="color: rgba(255, 215, 0, 0.7);">Email Reminders</p>
      </div>
      <div class="luxury-panel p-4 text-center">
        <div class="text-3xl mb-2">💾</div>
        <p class="text-2xl font-bold" style="color: #FFD700;">${formData ? 'Yes' : 'No'}</p>
        <p class="text-sm" style="color: rgba(255, 215, 0, 0.7);">Data Saved</p>
      </div>
    `;
  } catch (e) {
    console.error('Error loading data stats:', e);
  }
}

// Initialize data stats on page load
document.addEventListener('DOMContentLoaded', function() {
  loadDataStats();
});
