// ========== LOCAL STORAGE MANAGEMENT ==========
const STORAGE_KEYS = {
  FORM_DATA: 'birthdayFormData',
  GENERATED_LINKS: 'generatedLinks',
  USER_PREFERENCES: 'userPreferences',
  REMINDERS: 'birthdayReminders',
  LINK_HISTORY: 'linkHistory'
};

// Save form data to local storage
function saveFormData() {
  const formData = {
    celebrantName: document.getElementById("celebrantNameInput")?.value || '',
    birthdayDate: document.getElementById("birthdayDate")?.value || '',
    message: document.getElementById("messageInput")?.value || '',
    sender: document.getElementById("senderInput")?.value || '',
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
}

// Load form data from local storage
function loadFormData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
    if (savedData) {
      const formData = JSON.parse(savedData);
      
      // Populate form fields if elements exist
      if (document.getElementById("celebrantNameInput")) {
        document.getElementById("celebrantNameInput").value = formData.celebrantName || '';
      }
      if (document.getElementById("birthdayDate")) {
        document.getElementById("birthdayDate").value = formData.birthdayDate || '';
      }
      if (document.getElementById("messageInput")) {
        document.getElementById("messageInput").value = formData.message || '';
      }
      if (document.getElementById("senderInput")) {
        document.getElementById("senderInput").value = formData.sender || '';
      }
    }
  } catch (e) {
    console.log('No saved form data found');
  }
}

// Save generated link to history
function saveGeneratedLink(linkData) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINK_HISTORY) || '[]');
    const linkEntry = {
      id: Date.now(),
      ...linkData,
      createdAt: new Date().toISOString()
    };
    
    history.unshift(linkEntry); // Add to beginning
    
    // Keep only last 50 links
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem(STORAGE_KEYS.LINK_HISTORY, JSON.stringify(history));
    displayLinkHistory();
  } catch (e) {
    console.error('Error saving link to history:', e);
  }
}

// Display link history
function displayLinkHistory() {
  const historyContainer = document.getElementById('linkHistory');
  if (!historyContainer) return;
  
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINK_HISTORY) || '[]');
    
    if (history.length === 0) {
      historyContainer.innerHTML = `
        <div class="text-center py-4">
          <p style="color: rgba(255, 215, 0, 0.6);">No links generated yet</p>
        </div>
      `;
      return;
    }
    
    historyContainer.innerHTML = history.slice(0, 10).map(link => `
      <div class="luxury-panel p-3 mb-2 flex justify-between items-center">
        <div class="flex-1">
          <p class="font-semibold" style="color: #FFD700;">${link.name}</p>
          <p class="text-sm" style="color: rgba(255, 215, 0, 0.7);">
            ${new Date(link.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div class="flex gap-2">
          <button onclick="reloadLink('${link.id}')" class="btn-black px-2 py-1 text-xs rounded">
            <i class="fas fa-redo"></i>
          </button>
          <button onclick="deleteFromHistory('${link.id}')" class="btn-black px-2 py-1 text-xs rounded">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error displaying link history:', e);
  }
}

// Reload a link from history
window.reloadLink = function(linkId) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINK_HISTORY) || '[]');
    const link = history.find(l => l.id == linkId);
    
    if (link) {
      // Populate form with saved data
      document.getElementById("celebrantNameInput").value = link.name || '';
      document.getElementById("messageInput").value = link.message || '';
      document.getElementById("senderInput").value = link.sender || '';
      
      // Regenerate the link
      generateMagicLink();
      showNotification('Link reloaded from history!', 'success');
    }
  } catch (e) {
    console.error('Error reloading link:', e);
  }
};

// Delete from history
window.deleteFromHistory = function(linkId) {
  try {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINK_HISTORY) || '[]');
    history = history.filter(l => l.id != linkId);
    localStorage.setItem(STORAGE_KEYS.LINK_HISTORY, JSON.stringify(history));
    displayLinkHistory();
    showNotification('Link removed from history', 'success');
  } catch (e) {
    console.error('Error deleting from history:', e);
  }
};

// Clear all data from local storage
window.clearAllData = function() {
  if (!confirm('Are you sure you want to clear ALL saved data? This cannot be undone!')) {
    return;
  }
  
  try {
    // Clear all storage keys
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear form inputs
    const formInputs = ['celebrantNameInput', 'birthdayDate', 'messageInput', 'senderInput'];
    formInputs.forEach(inputId => {
      const element = document.getElementById(inputId);
      if (element) element.value = '';
    });
    
    // Refresh displays
    displayLinkHistory();
    displayReminderList();
    
    showNotification('All data cleared successfully!', 'success');
  } catch (e) {
    console.error('Error clearing data:', e);
    showNotification('Error clearing data', 'error');
  }
};

// Export data for backup
window.exportData = function() {
  try {
    const data = {
      formData: JSON.parse(localStorage.getItem(STORAGE_KEYS.FORM_DATA) || '{}'),
      linkHistory: JSON.parse(localStorage.getItem(STORAGE_KEYS.LINK_HISTORY) || '[]'),
      reminders: JSON.parse(localStorage.getItem(STORAGE_KEYS.REMINDERS) || '{}'),
      userPreferences: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}'),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthday-website-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
  } catch (e) {
    console.error('Error exporting data:', e);
    showNotification('Error exporting data', 'error');
  }
};

// Import data from backup
window.importData = function(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Import each section
      if (data.formData) {
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(data.formData));
      }
      if (data.linkHistory) {
        localStorage.setItem(STORAGE_KEYS.LINK_HISTORY, JSON.stringify(data.linkHistory));
      }
      if (data.reminders) {
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(data.reminders));
      }
      if (data.userPreferences) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.userPreferences));
      }
      
      // Reload page to apply changes
      showNotification('Data imported successfully! Reloading...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error importing data:', error);
      showNotification('Invalid backup file', 'error');
    }
  };
  reader.readAsText(file);
};

// Save user preferences
function saveUserPreferences(preferences) {
  try {
    const currentPrefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}');
    const updatedPrefs = { ...currentPrefs, ...preferences };
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
  } catch (e) {
    console.error('Error saving preferences:', e);
  }
}

// Load user preferences
function loadUserPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}');
  } catch (e) {
    console.error('Error loading preferences:', e);
    return {};
  }
}

// Auto-save form data on input changes
function setupAutoSave() {
  const formInputs = [
    'celebrantNameInput',
    'birthdayDate', 
    'messageInput',
    'senderInput'
  ];
  
  formInputs.forEach(inputId => {
    const element = document.getElementById(inputId);
    if (element) {
      element.addEventListener('input', saveFormData);
      element.addEventListener('change', saveFormData);
    }
  });
}

// ========== CUSTOM NOTIFICATION SYSTEM ==========
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

// Create Happy Birthday melody using Web Audio API (works without external files!)
let audioContext = null;
let isPlaying = false;
let currentOscillator = null;

// Happy Birthday notes (frequencies in Hz)
// C D E C C D
const happyBirthdayNotes = [
  { note: "C4", freq: 261.63, duration: 0.4 }, // Hap-
  { note: "D4", freq: 293.66, duration: 0.4 }, // py
  { note: "E4", freq: 329.63, duration: 0.4 }, // Birth-
  { note: "C4", freq: 261.63, duration: 0.4 }, // day
  { note: "C4", freq: 261.63, duration: 0.4 }, // to
  { note: "D4", freq: 293.66, duration: 0.8 }, // you
  { note: "C4", freq: 261.63, duration: 0.4 }, // Hap-
  { note: "D4", freq: 293.66, duration: 0.4 }, // py
  { note: "E4", freq: 329.63, duration: 0.4 }, // Birth-
  { note: "C4", freq: 261.63, duration: 0.4 }, // day
  { note: "G4", freq: 392.0, duration: 0.4 }, // to
  { note: "F4", freq: 349.23, duration: 0.8 }, // you
  { note: "C4", freq: 261.63, duration: 0.4 }, // Hap-
  { note: "C4", freq: 261.63, duration: 0.4 }, // py
  { note: "A4", freq: 440.0, duration: 0.4 }, // Birth-
  { note: "F4", freq: 349.23, duration: 0.4 }, // day
  { note: "E4", freq: 329.63, duration: 0.4 }, // dear
  { note: "D4", freq: 293.66, duration: 0.4 }, // [Name]
  { note: "A4", freq: 440.0, duration: 0.4 }, // Hap-
  { note: "G4", freq: 392.0, duration: 0.4 }, // py
  { note: "F4", freq: 349.23, duration: 0.8 }, // you
];

function playHappyBirthday() {
  if (audioContext === null) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Resume if suspended (browser policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  isPlaying = true;
  let currentTime = audioContext.currentTime;

  happyBirthdayNotes.forEach((noteData, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = noteData.freq;
    oscillator.type = "sine";

    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + index * 0.45);
    gainNode.gain.linearRampToValueAtTime(
      0,
      currentTime + index * 0.45 + noteData.duration,
    );

    oscillator.start(currentTime + index * 0.45);
    oscillator.stop(currentTime + index * 0.45 + noteData.duration);
  });

  // Add floating music notes animation
  for (let i = 0; i < 20; i++) {
    setTimeout(() => createFloatingMusicNote(), i * 150);
  }
}

function stopHappyBirthday() {
  isPlaying = false;
  // No need to stop individually, notes will finish naturally
}

// Fallback: Use Audio element with online source if available
const useFallbackAudio = () => {
  const audio = document.getElementById("birthdaySong");
  audio
    .play()
    .catch((e) => console.log("Auto-play blocked, user interaction needed"));
};

// ========== CONFETTI SYSTEM ==========
const canvas = document.getElementById("confetti-canvas");
let ctx = canvas.getContext("2d");
let confettiActive = false;
let confettiParticles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createConfetti() {
  const colors = [
    "#FFD700",
    "#FFA500",
    "#FFDF00",
    "#DAA520",
    "#F0E68C",
    "#FFE55C",
    "#FFED4E",
    "#FFC700",
  ];
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 10 + 4,
    speedY: Math.random() * 8 + 5,
    speedX: Math.random() * 4 - 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotSpeed: Math.random() * 10 - 5,
  };
}

function startConfetti(duration = 4000) {
  if (confettiActive) return;
  confettiActive = true;
  confettiParticles = [];
  for (let i = 0; i < 300; i++) {
    confettiParticles.push(createConfetti());
  }

  const startTime = Date.now();
  function animate() {
    if (!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let stillActive = false;
    for (let i = 0; i < confettiParticles.length; i++) {
      const p = confettiParticles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y < canvas.height + 50) {
        stillActive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    }

    if (stillActive && Date.now() - startTime < duration) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiActive = false;
    }
  }

  animate();
}

function createFloatingMusicNote() {
  const note = document.createElement("div");
  note.className = "music-note";
  const notes = ["♪", "♫", "🎵", "🎶", "🎹"];
  note.innerHTML = notes[Math.floor(Math.random() * notes.length)];
  note.style.left = Math.random() * window.innerWidth + "px";
  note.style.top = window.innerHeight - 50 + "px";
  note.style.color = `#FFD700`;
  note.style.textShadow = `0 0 10px rgba(255, 215, 0, 0.8)`;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 2000);
}

window.playConfettiAndSong = function () {
  startConfetti(4000);
  playRealBirthdaySong();
  createGoldParticles();
  for (let i = 0; i < 30; i++) {
    setTimeout(() => createFloatingMusicNote(), i * 100);
  }
};

// Create gold particles effect
function createGoldParticles() {
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'gold-particle';
      particle.style.left = Math.random() * window.innerWidth + 'px';
      particle.style.bottom = '0px';
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 3000);
    }, i * 50);
  }
}

window.playConfetti = function () {
  startConfetti(3000);
};

// Song control functions
window.playMusicEffect = function () {
  playRealBirthdaySong();
};

// Real Birthday Song Player
let realSongPlaying = false;
function playRealBirthdaySong() {
  const audio = document.getElementById("birthdaySong");
  if (audio) {
    audio.play().catch((e) => {
      console.log("Audio autoplay blocked, trying synthesized version");
      playHappyBirthday();
    });
    realSongPlaying = true;
  } else {
    playHappyBirthday();
  }
}

function stopRealBirthdaySong() {
  const audio = document.getElementById("birthdaySong");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  realSongPlaying = false;
}

window.toggleSong = function () {
  const audio = document.getElementById("birthdaySong");
  const musicIcon = document.getElementById("musicIcon");
  
  if (realSongPlaying) {
    stopRealBirthdaySong();
    stopHappyBirthday();
    musicIcon.className = "fas fa-music text-base sm:text-xl";
    musicIcon.style.color = "#FFD700";
  } else {
    playRealBirthdaySong();
    musicIcon.className = "fas fa-stop text-base sm:text-xl";
    musicIcon.style.color = "#FFD700";
  }
};

window.goBackToHome = function () {
  // Hide celebration view and show generator view
  document.getElementById("celebrantView").classList.add("hidden");
  document.getElementById("generatorView").classList.remove("hidden");
  
  // Stop any playing music
  stopRealBirthdaySong();
  stopHappyBirthday();
  isPlaying = false;
  realSongPlaying = false;
  
  // Reset music icon
  const musicIcon = document.getElementById("musicIcon");
  if (musicIcon) {
    musicIcon.className = "fas fa-music text-base sm:text-xl";
    musicIcon.style.color = "#FFD700";
  }
  
  // Clear URL parameters if any
  if (window.history && window.history.pushState) {
    const cleanUrl = window.location.href.split('?')[0];
    window.history.pushState({}, document.title, cleanUrl);
  }
};

// ========== LINK GENERATION ==========
function generateMagicLink() {
  const name = document.getElementById("celebrantNameInput").value.trim();
  const message = document.getElementById("messageInput").value.trim();
  const sender = document.getElementById("senderInput").value.trim();

  if (!name) {
    showNotification("Please enter the birthday person's name!", "warning");
    return;
  }

  const cardData = {
    name: name,
    message:
      message ||
      `Wishing you a day filled with happiness, laughter, and all your favorite things. May this year bring you everything you've been dreaming of! 🎂✨`,
    sender: sender || "Your Loved Ones",
  };

  const encodedData = btoa(encodeURIComponent(JSON.stringify(cardData)));
  const currentUrl = window.location.href.split("?")[0].split("#")[0];
  const magicLink = `${currentUrl}?magic=${encodedData}`;

  document.getElementById("magicLinkDisplay").innerHTML = magicLink;
  document.getElementById("linkResult").classList.remove("hidden");
  document.getElementById("noLinkYet").classList.add("hidden");

  window.currentMagicLink = magicLink;
  window.currentCardData = cardData;

  // Save to local storage
  saveFormData();
  saveGeneratedLink(cardData);

  // Show reminder section if birthday date is set
  const birthdayDate = document.getElementById("birthdayDate").value;
  if (birthdayDate) {
    document.getElementById("reminderSection").classList.remove("hidden");
    document.getElementById("reminderDate").value = birthdayDate;
    document.getElementById("reminderDate").min = new Date()
      .toISOString()
      .split("T")[0];
  }

  startConfetti(1500);
  showNotification("Magic link generated and saved!", "success");
}

window.copyLink = function () {
  if (window.currentMagicLink) {
    navigator.clipboard.writeText(window.currentMagicLink).then(() => {
      showNotification(
        "Magic link copied! Share it with the birthday person!",
        "success",
      );
    });
  }
};

window.testLink = function () {
  if (window.currentCardData) {
    showMagicCelebration(window.currentCardData);
  }
};

window.shareWhatsApp = function () {
  if (window.currentMagicLink) {
    const text = encodeURIComponent(
      `🎂 Happy Birthday! Here's a magical birthday surprise with music for you! 🎵🎈\n\n${window.currentMagicLink}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }
};

window.shareMessenger = function () {
  if (window.currentMagicLink) {
    const text = encodeURIComponent(
      `🎂 Happy Birthday! Here's a magical birthday surprise with music for you! 🎵🎈\n\n${window.currentMagicLink}`,
    );
    window.open(
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.currentMagicLink)}&app_id=0&redirect_uri=${encodeURIComponent(window.location.href)}`,
      "_blank",
    );
  }
};

window.shareEmail = function () {
  if (window.currentMagicLink) {
    const name = document.getElementById("celebrantNameInput").value.trim();
    const subject = encodeURIComponent(`🎂 Happy Birthday ${name}!`);
    const body = encodeURIComponent(
      `Happy Birthday ${name}! 🎉🎈\n\nI've created a special birthday surprise just for you with music and animations!\n\nClick here to see it: ${window.currentMagicLink}\n\nHope you have an amazing day!\n\nWith love ❤️`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
};

// ========== MAGIC CELEBRATION VIEW ==========
function showMagicCelebration(data) {
  document.getElementById("celebrantName").innerHTML =
    `Dear ${escapeHtml(data.name)}!`;
  document.getElementById("celebrantMessage").innerHTML = escapeHtml(
    data.message,
  );
  document.getElementById("celebrantSender").innerHTML = escapeHtml(
    data.sender,
  );

  document.getElementById("generatorView").classList.add("hidden");
  document.getElementById("celebrantView").classList.remove("hidden");

  // Start the magic!
  setTimeout(() => {
    startConfetti(5000);
    playRealBirthdaySong();
    createGoldParticles();

    // Create floating music notes
    for (let i = 0; i < 40; i++) {
      setTimeout(() => createFloatingMusicNote(), i * 150);
    }
  }, 500);
}

// Check URL for magic link on page load
function checkForMagicLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const magicData = urlParams.get("magic");

  if (magicData) {
    try {
      const decodedData = JSON.parse(decodeURIComponent(atob(magicData)));
      showMagicCelebration(decodedData);
      return true;
    } catch (e) {
      console.log("Invalid magic link");
    }
  }
  return false;
}

// ========== PRESETS ==========
const presetMessages = {
  Dad: "Thank you for always being my hero and guide. Your wisdom and love mean the world to me. Have an amazing day, Dad! 🎉",
  Mom: "You are the heart of our family. Thank you for your endless love and care. Wishing you the happiest birthday, Mom! 💝",
  Grandma:
    "Your love and warmth have made my life so special. Thank you for all the cookies, hugs, and memories. Love you, Grandma! 👵",
  Grandpa:
    "Your stories and wisdom have shaped who I am today. So grateful for you, Grandpa. Happy Birthday! 🎈",
  Sister:
    "From sharing secrets to sharing dreams, you're the best sister anyone could ask for. Love you loads! 👧",
  Brother:
    "Thanks for all the adventures, laughs, and being my best friend. Have an epic birthday, bro! 🎮",
  "Best Friend":
    "Life is better with a friend like you by my side. Cheers to you on your special day! 🥂",
  Wife: "Every day with you is a gift. Thank you for being my partner, my love, and my best friend. 💍",
  Husband:
    "You make every day brighter. So blessed to share this life with you. Happy Birthday, my love! 💑",
};

window.setPreset = function (person) {
  document.getElementById("celebrantNameInput").value = person;
  if (presetMessages[person]) {
    document.getElementById("messageInput").value = presetMessages[person];
  }
  
  // Save the updated form data
  saveFormData();
  showNotification(`Preset loaded for ${person}`, "info", 2000);
};

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// ========== ENHANCED REMINDER SYSTEM WITH MULTI-USER SUPPORT ==========
window.setReminder = function () {
  const reminderDate = document.getElementById("reminderDate").value;
  const name = document.getElementById("celebrantNameInput").value;
  const birthdayDate = document.getElementById("birthdayDate").value;

  if (!reminderDate) {
    showNotification("Please select a reminder date!", "warning");
    return;
  }

  // Store reminder with unique ID for multi-user support
  const reminders = JSON.parse(localStorage.getItem("birthdayReminders") || "{}");
  const reminderId = `${name}_${birthdayDate}_${Date.now()}`;
  
  reminders[reminderId] = {
    name: name,
    birthdayDate: birthdayDate,
    reminderDate: reminderDate,
    link: window.currentMagicLink,
    message: document.getElementById("messageInput").value,
    sender: document.getElementById("senderInput").value,
    createdAt: new Date().toISOString(),
    notified: false
  };
  
  localStorage.setItem("birthdayReminders", JSON.stringify(reminders));

  showNotification(`Reminder set for ${name}'s birthday on ${new Date(reminderDate).toLocaleDateString()}! 🔔`, "success");

  // Check reminders immediately
  checkReminders();
};

// Enhanced reminder checking with notifications
function checkReminders() {
  const reminders = JSON.parse(localStorage.getItem("birthdayReminders") || "{}");
  const today = new Date().toISOString().split('T')[0];
  let hasReminders = false;

  for (const reminderId in reminders) {
    const reminder = reminders[reminderId];
    
    // Check if reminder date matches today and hasn't been notified
    if (reminder.reminderDate === today && !reminder.notified) {
      showNotification(`🎂 Reminder: ${reminder.name}'s birthday is coming up!`, "info", 8000);
      hasReminders = true;
      
      // Mark as notified
      reminder.notified = true;
      reminders[reminderId] = reminder;
    }
    
    // Check if it's the actual birthday
    if (reminder.birthdayDate === today) {
      showNotification(`🎉 Today is ${reminder.name}'s birthday! Don't forget to send your wishes!`, "success", 10000);
      hasReminders = true;
    }
  }

  // Save updated reminders
  localStorage.setItem("birthdayReminders", JSON.stringify(reminders));
  
  // Show reminder list if there are any
  if (hasReminders) {
    displayReminderList();
  }
}

// Display all active reminders
function displayReminderList() {
  const reminders = JSON.parse(localStorage.getItem("birthdayReminders") || "{}");
  const reminderContainer = document.getElementById("activeReminders");
  
  if (!reminderContainer) return;
  
  let html = '<div class="luxury-panel p-4 mt-4"><h3 class="text-lg font-bold mb-3" style="color: #FFD700;"><i class="fas fa-bell"></i> Active Reminders</h3>';
  
  let count = 0;
  for (const reminderId in reminders) {
    const reminder = reminders[reminderId];
    const reminderDateObj = new Date(reminder.reminderDate);
    const birthdayDateObj = new Date(reminder.birthdayDate);
    
    html += `
      <div class="luxury-panel p-3 mb-2 flex justify-between items-center">
        <div>
          <p style="color: #FFD700;" class="font-semibold">${reminder.name}</p>
          <p style="color: rgba(255, 215, 0, 0.7);" class="text-sm">Birthday: ${birthdayDateObj.toLocaleDateString()}</p>
          <p style="color: rgba(255, 215, 0, 0.5);" class="text-xs">Remind on: ${reminderDateObj.toLocaleDateString()}</p>
        </div>
        <button onclick="deleteReminder('${reminderId}')" class="btn-black px-3 py-1 text-xs rounded">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    count++;
  }
  
  if (count === 0) {
    html += '<p style="color: rgba(255, 215, 0, 0.6);" class="text-sm">No active reminders</p>';
  }
  
  html += '</div>';
  reminderContainer.innerHTML = html;
}

// Delete a specific reminder
window.deleteReminder = function(reminderId) {
  const reminders = JSON.parse(localStorage.getItem("birthdayReminders") || "{}");
  delete reminders[reminderId];
  localStorage.setItem("birthdayReminders", JSON.stringify(reminders));
  showNotification("Reminder deleted!", "success");
  displayReminderList();
};

// Check reminders on page load and every hour
setInterval(checkReminders, 3600000); // Check every hour

// Initialize
if (!checkForMagicLink()) {
  document.getElementById("generatorView").classList.remove("hidden");
  document.getElementById("celebrantView").classList.add("hidden");
  
  // Load saved form data
  loadFormData();
  
  // Set up auto-save
  setupAutoSave();
  
  // Load link history
  displayLinkHistory();
  
  // Set default values if no saved data
  if (!document.getElementById("celebrantNameInput").value) {
    document.getElementById("celebrantNameInput").value = "Dad";
    document.getElementById("messageInput").value = presetMessages["Dad"];
  }
  
  checkReminders();
}

// Debug function to test the flow
window.debugFlow = function() {
  console.log("Generator View Hidden:", document.getElementById("generatorView").classList.contains("hidden"));
  console.log("Celebrant View Hidden:", document.getElementById("celebrantView").classList.contains("hidden"));
  console.log("Home button exists:", !!document.querySelector('.home-button'));
};
