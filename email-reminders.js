// Initialize EmailJS
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // User needs to replace this
})();

// Storage keys for better organization
const EMAIL_STORAGE_KEYS = {
    REMINDERS: 'emailReminders',
    USER_SETTINGS: 'emailUserSettings',
    FORM_DATA: 'reminderFormData'
};

// Save form data automatically
function saveReminderFormData() {
    const formData = {
        userEmail: document.getElementById('userEmail')?.value || '',
        birthdayName: document.getElementById('birthdayName')?.value || '',
        birthdayDate: document.getElementById('birthdayDateInput')?.value || '',
        reminderDate: document.getElementById('reminderDateInput')?.value || '',
        reminderNote: document.getElementById('reminderNote')?.value || '',
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(EMAIL_STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
}

// Load form data
function loadReminderFormData() {
    try {
        const savedData = localStorage.getItem(EMAIL_STORAGE_KEYS.FORM_DATA);
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            if (document.getElementById('userEmail')) {
                document.getElementById('userEmail').value = formData.userEmail || '';
            }
            if (document.getElementById('birthdayName')) {
                document.getElementById('birthdayName').value = formData.birthdayName || '';
            }
            if (document.getElementById('birthdayDateInput')) {
                document.getElementById('birthdayDateInput').value = formData.birthdayDate || '';
            }
            if (document.getElementById('reminderDateInput')) {
                document.getElementById('reminderDateInput').value = formData.reminderDate || '';
            }
            if (document.getElementById('reminderNote')) {
                document.getElementById('reminderNote').value = formData.reminderNote || '';
            }
        }
    } catch (e) {
        console.log('No saved reminder form data found');
    }
}

// Setup auto-save for reminder form
function setupReminderAutoSave() {
    const formInputs = [
        'userEmail',
        'birthdayName',
        'birthdayDateInput',
        'reminderDateInput',
        'reminderNote'
    ];
    
    formInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', saveReminderFormData);
            element.addEventListener('change', saveReminderFormData);
        }
    });
}

// Notification system
function showNotification(message, type = "info", duration = 3000) {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `notification-toast notification-${type} animate-slideIn`;

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  notification.innerHTML = `
    <div class="luxury-panel border-l-4 rounded-lg p-4 shadow-lg flex items-center gap-3 pointer-events-auto" style="border-left-color: #FFD700;">
      <i class="fas ${icons[type]} text-lg" style="color: #FFD700;"></i>
      <span class="font-medium" style="color: #FFD700;">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-auto opacity-60 hover:opacity-100" style="color: #FFD700;">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("animate-slideOut");
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Handle reminder form submission
document.getElementById('reminderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userEmail = document.getElementById('userEmail').value.trim();
    const birthdayName = document.getElementById('birthdayName').value.trim();
    const birthdayDate = document.getElementById('birthdayDateInput').value;
    const reminderDate = document.getElementById('reminderDateInput').value;
    const reminderNote = document.getElementById('reminderNote').value.trim();

    // Validation
    if (!userEmail || !birthdayName || !birthdayDate || !reminderDate) {
        showNotification('Please fill in all required fields!', 'warning');
        return;
    }

    // Check if reminder date is before birthday
    if (new Date(reminderDate) > new Date(birthdayDate)) {
        showNotification('Reminder date should be before the birthday!', 'warning');
        return;
    }

    // Create reminder object
    const reminder = {
        id: `reminder_${Date.now()}`,
        userEmail: userEmail,
        birthdayName: birthdayName,
        birthdayDate: birthdayDate,
        reminderDate: reminderDate,
        reminderNote: reminderNote,
        createdAt: new Date().toISOString(),
        emailSent: false
    };

    // Save to localStorage
    saveReminder(reminder);

    // Schedule email (in real implementation, this would be server-side)
    scheduleEmailReminder(reminder);

    // Show success message
    showNotification(`Reminder set for ${birthdayName}'s birthday! 🎉`, 'success');

    // Reset form
    document.getElementById('reminderForm').reset();

    // Reload reminders list
    loadReminders();
});

// Save reminder to localStorage
function saveReminder(reminder) {
    const reminders = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.REMINDERS) || '[]');
    reminders.push(reminder);
    localStorage.setItem(EMAIL_STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    
    // Also save user settings for convenience
    const userSettings = {
        lastUsedEmail: reminder.userEmail,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(EMAIL_STORAGE_KEYS.USER_SETTINGS, JSON.stringify(userSettings));
}

// Load and display reminders
function loadReminders() {
    const reminders = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.REMINDERS) || '[]');
    const remindersList = document.getElementById('remindersList');
    const noReminders = document.getElementById('noReminders');

    if (!remindersList) return;

    if (reminders.length === 0) {
        remindersList.innerHTML = '';
        if (noReminders) noReminders.classList.remove('hidden');
        return;
    }

    if (noReminders) noReminders.classList.add('hidden');

    // Sort by reminder date
    reminders.sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));

    remindersList.innerHTML = reminders.map(reminder => {
        const birthdayDateObj = new Date(reminder.birthdayDate);
        const reminderDateObj = new Date(reminder.reminderDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isPast = reminderDateObj < today;
        const isToday = reminderDateObj.toDateString() === today.toDateString();

        return `
            <div class="luxury-panel p-4 mb-3 ${isPast ? 'opacity-60' : ''}">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg" style="color: #FFD700;">
                            ${reminder.birthdayName}
                            ${isToday ? '<span class="text-sm ml-2">🔔 Today!</span>' : ''}
                        </h3>
                        <p class="text-sm" style="color: rgba(255, 215, 0, 0.7);">
                            <i class="fas fa-birthday-cake"></i> Birthday: ${birthdayDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p class="text-sm" style="color: rgba(255, 215, 0, 0.7);">
                            <i class="fas fa-bell"></i> Reminder: ${reminderDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        ${reminder.reminderNote ? `
                            <p class="text-sm mt-2 italic" style="color: rgba(255, 215, 0, 0.6);">
                                "${reminder.reminderNote}"
                            </p>
                        ` : ''}
                        <p class="text-xs mt-2" style="color: rgba(255, 215, 0, 0.5);">
                            <i class="fas fa-envelope"></i> ${reminder.userEmail}
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editReminder('${reminder.id}')" 
                            class="btn-black px-3 py-2 rounded-lg text-sm">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteReminder('${reminder.id}')" 
                            class="btn-black px-3 py-2 rounded-lg text-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${reminder.emailSent ? `
                    <div class="text-xs mt-2 px-2 py-1 rounded" style="background: rgba(0, 255, 0, 0.1); color: rgba(0, 255, 0, 0.8);">
                        <i class="fas fa-check"></i> Email sent
                    </div>
                ` : isPast ? `
                    <div class="text-xs mt-2 px-2 py-1 rounded" style="background: rgba(255, 165, 0, 0.1); color: rgba(255, 165, 0, 0.8);">
                        <i class="fas fa-clock"></i> Reminder date passed
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Edit reminder function
window.editReminder = function(reminderId) {
    try {
        const reminders = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.REMINDERS) || '[]');
        const reminder = reminders.find(r => r.id === reminderId);
        
        if (reminder) {
            // Populate form with reminder data
            document.getElementById('userEmail').value = reminder.userEmail;
            document.getElementById('birthdayName').value = reminder.birthdayName;
            document.getElementById('birthdayDateInput').value = reminder.birthdayDate;
            document.getElementById('reminderDateInput').value = reminder.reminderDate;
            document.getElementById('reminderNote').value = reminder.reminderNote || '';
            
            // Delete the old reminder
            deleteReminder(reminderId);
            
            // Scroll to form
            document.getElementById('reminderForm').scrollIntoView({ behavior: 'smooth' });
            
            showNotification('Reminder loaded for editing', 'info');
        }
    } catch (e) {
        console.error('Error editing reminder:', e);
    }
};

// Delete reminder
window.deleteReminder = function(reminderId) {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    let reminders = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.REMINDERS) || '[]');
    reminders = reminders.filter(r => r.id !== reminderId);
    localStorage.setItem(EMAIL_STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));

    showNotification('Reminder deleted!', 'success');
    loadReminders();
};

// Schedule email reminder (simulated - in production, use a backend service)
function scheduleEmailReminder(reminder) {
    // In a real implementation, this would send data to a backend service
    // that schedules the email using a service like:
    // - AWS SES + Lambda
    // - SendGrid + Cron Job
    // - Firebase Cloud Functions
    // - Node.js server with node-cron
    
    // For demo purposes, we'll check reminders on page load
    console.log('Reminder scheduled:', reminder);
    
    // Simulate immediate email for testing (if reminder date is today)
    const today = new Date().toISOString().split('T')[0];
    if (reminder.reminderDate === today && !reminder.emailSent) {
        sendReminderEmail(reminder);
    }
}

// Send reminder email using EmailJS
function sendReminderEmail(reminder) {
    const templateParams = {
        to_email: reminder.userEmail,
        to_name: reminder.userEmail.split('@')[0],
        birthday_name: reminder.birthdayName,
        birthday_date: new Date(reminder.birthdayDate).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        reminder_note: reminder.reminderNote || 'No additional notes',
        website_link: window.location.origin + '/generator.html'
    };

    // Note: Users need to set up EmailJS account and replace with their IDs
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            
            // Mark as sent in local storage
            let reminders = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.REMINDERS) || '[]');
            const index = reminders.findIndex(r => r.id === reminder.id);
            if (index !== -1) {
                reminders[index].emailSent = true;
                localStorage.setItem(EMAIL_STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
            }
            
            showNotification('Reminder email sent! 📧', 'success');
            loadReminders();
        }, function(error) {
            console.error('Failed to send email:', error);
            showNotification('Failed to send email. Please check your EmailJS configuration.', 'error');
        });
}

// Check for due reminders on page load
function checkDueReminders() {
    const reminders = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.REMINDERS) || '[]');
    const today = new Date().toISOString().split('T')[0];

    reminders.forEach(reminder => {
        if (reminder.reminderDate === today && !reminder.emailSent) {
            // In production, this would be handled by a backend service
            // For demo, we show a notification
            showNotification(`Reminder: ${reminder.birthdayName}'s birthday is coming up!`, 'info', 8000);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved form data
    loadReminderFormData();
    
    // Set up auto-save
    setupReminderAutoSave();
    
    // Load reminders
    loadReminders();
    
    // Check for due reminders
    checkDueReminders();
    
    // Set minimum date for inputs to today
    const today = new Date().toISOString().split('T')[0];
    const reminderDateInput = document.getElementById('reminderDateInput');
    const birthdayDateInput = document.getElementById('birthdayDateInput');
    
    if (reminderDateInput) reminderDateInput.min = today;
    if (birthdayDateInput) birthdayDateInput.min = today;
});

// Export reminder data for backup
window.exportReminderData = function() {
  try {
    const reminders = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.REMINDERS) || '[]');
    const formData = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.FORM_DATA) || '{}');
    const userSettings = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.USER_SETTINGS) || '{}');
    
    const data = {
      reminders: reminders,
      formData: formData,
      userSettings: userSettings,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthday-reminders-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Reminders exported successfully!', 'success');
  } catch (e) {
    console.error('Error exporting reminders:', e);
    showNotification('Error exporting reminders', 'error');
  }
};

// Import reminder data from backup
window.importReminderData = function(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.reminders) {
        localStorage.setItem(EMAIL_STORAGE_KEYS.REMINDERS, JSON.stringify(data.reminders));
      }
      if (data.formData) {
        localStorage.setItem(EMAIL_STORAGE_KEYS.FORM_DATA, JSON.stringify(data.formData));
      }
      if (data.userSettings) {
        localStorage.setItem(EMAIL_STORAGE_KEYS.USER_SETTINGS, JSON.stringify(data.userSettings));
      }
      
      showNotification('Reminders imported successfully! Reloading...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error importing reminders:', error);
      showNotification('Invalid backup file', 'error');
    }
  };
  reader.readAsText(file);
};

// Clear all reminder data
window.clearAllReminderData = function() {
  if (!confirm('Are you sure you want to clear ALL reminder data? This cannot be undone!')) {
    return;
  }
  
  try {
    localStorage.removeItem(EMAIL_STORAGE_KEYS.REMINDERS);
    localStorage.removeItem(EMAIL_STORAGE_KEYS.FORM_DATA);
    localStorage.removeItem(EMAIL_STORAGE_KEYS.USER_SETTINGS);
    
    loadReminders();
    loadReminderFormData();
    
    showNotification('All reminder data cleared!', 'success');
  } catch (e) {
    console.error('Error clearing reminder data:', e);
    showNotification('Error clearing data', 'error');
  }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveReminder,
    loadReminders,
    scheduleEmailReminder,
    exportReminderData,
    importReminderData,
    clearAllReminderData
  };
}
