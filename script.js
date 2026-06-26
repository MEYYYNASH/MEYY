document.addEventListener('DOMContentLoaded', () => {
  // --- Core Elements ---
  const body = document.body;
  const cursorGlow = document.getElementById('cursor-glow');
  const loaderScreen = document.getElementById('loader-screen');
  const loaderProgress = document.querySelector('.loader-progress');
  const toastContainer = document.getElementById('toast-container');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  // --- Theme Management ---
  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
  body.setAttribute('data-theme', savedTheme);

  const btnThemeLight = document.getElementById('btn-theme-light');
  const btnThemeDark = document.getElementById('btn-theme-dark');
  const themeActivePill = document.getElementById('theme-active-pill');

  function updateThemePill(activeBtn) {
    if (!themeActivePill || !activeBtn) return;
    themeActivePill.style.left = `${activeBtn.offsetLeft}px`;
    themeActivePill.style.width = `${activeBtn.offsetWidth}px`;
  }

  // Initialize theme controls
  if (savedTheme === 'dark') {
    btnThemeDark.classList.add('active');
    btnThemeLight.classList.remove('active');
    setTimeout(() => updateThemePill(btnThemeDark), 100);
  } else {
    btnThemeLight.classList.add('active');
    btnThemeDark.classList.remove('active');
    setTimeout(() => updateThemePill(btnThemeLight), 100);
  }

  function setTheme(theme) {
    body.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    showToast('Theme Updated', `Switched to ${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`);
    
    // Broadcast theme to CyberTools iframe
    const iframe = document.getElementById('cybertools-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ action: 'setTheme', theme: theme }, '*');
    }
  }

  if (btnThemeLight && btnThemeDark) {
    btnThemeLight.addEventListener('click', () => {
      btnThemeLight.classList.add('active');
      btnThemeDark.classList.remove('active');
      updateThemePill(btnThemeLight);
      setTheme('light');
    });

    btnThemeDark.addEventListener('click', () => {
      btnThemeDark.classList.add('active');
      btnThemeLight.classList.remove('active');
      updateThemePill(btnThemeDark);
      setTheme('dark');
    });
  }

  // --- Interactive Spatial Background Parallax & Cursor Glow ---
  window.addEventListener('mousemove', (e) => {
    // 3D Parallax Room movement
    const x = (e.clientX - window.innerWidth / 2) / 35;
    const y = (e.clientY - window.innerHeight / 2) / 35;
    const bg = document.querySelector('.spatial-bg-photo');
    if (bg) {
      bg.style.transform = `translate(${-x}px, ${-y}px) scale(1.02)`;
    }

    // Glow tracking
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  });

  // --- Canvas Particle Engine (Floating Glass Dust) ---
  let particlesArray = [];
  const numberOfParticles = 30;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.speedY = Math.random() * 0.2 - 0.1;
      this.opacity = Math.random() * 0.3 + 0.1;
    }

    update() {
      const mult = window.isOverclocked ? 6 : 1;
      this.x += this.speedX * mult;
      this.y += this.speedY * mult;

      if (this.x > canvas.width) this.x = 0;
      else if (this.x < 0) this.x = canvas.width;
      
      if (this.y > canvas.height) this.y = 0;
      else if (this.y < 0) this.y = canvas.height;
    }

    draw() {
      const isDark = body.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDark ? `rgba(90, 200, 250, ${this.opacity})` : `rgba(0, 122, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    if (!canvas) return;
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  initParticles();

  function animateParticles() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --- View Port Switcher & Synced Navigation ---
  const panels = document.querySelectorAll('.viewport-panel');
  const bottomNavButtons = document.querySelectorAll('.bottom-nav-btn[data-view]');

  function switchView(viewName) {
    // 1. Hide active panel and display target panel with crossfade
    const currentActivePanel = document.querySelector('.viewport-panel.active');
    const targetPanel = document.getElementById(`panel-${viewName}`);

    if (currentActivePanel) {
      currentActivePanel.style.opacity = '0';
      currentActivePanel.style.transform = 'translateY(14px)';
      setTimeout(() => {
        currentActivePanel.classList.remove('active');
        if (targetPanel) {
          targetPanel.classList.add('active');
          // Trigger reflow
          targetPanel.offsetHeight;
          targetPanel.style.opacity = '1';
          targetPanel.style.transform = 'translateY(0)';
        }
      }, 200);
    } else if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.style.opacity = '1';
      targetPanel.style.transform = 'translateY(0)';
    }

    // 2. Sync bottom navigation button active states
    bottomNavButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Skills overview progress fill triggers
    if (viewName === 'skills') {
      setTimeout(animateSkillsProgress, 300);
    }
  }

  // Bind Bottom Navigation Buttons Click
  bottomNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });

  // Bind Top Bar Avatar Click to switch to About
  const topAvatar = document.querySelector('.top-bar-avatar');
  if (topAvatar) {
    topAvatar.addEventListener('click', () => {
      switchView('about');
    });
  }

  // --- Siri & Project Card Search ---
  const siriInput = document.getElementById('spatial-search-input');
  const widgetSearchInput = document.getElementById('widget-project-search');
  const projectCards = document.querySelectorAll('.project-card-new, .project-card');

  // --- Greeting Typewriter Animation ---
  const typewriterEl = document.getElementById('greeting-typewriter');
  if (typewriterEl) {
    const phrases = [
      'Have a great day.',
      'Building cool things.',
      'Open to collaborations.',
      'Coding something awesome.',
      'Let\'s create together.',
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 80;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 40;
      } else {
        typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 80;
      }
      if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end
        typeDelay = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeDelay = 400;
      }
      setTimeout(typeLoop, typeDelay);
    }
    setTimeout(typeLoop, 1800); // Start after loader
  }

  function filterProjects(searchQuery) {
    const filterText = searchQuery.toLowerCase().trim();
    projectCards.forEach(card => {
      const titleEl = card.querySelector('.project-card-title') || card.querySelector('.project-title');
      const descEl = card.querySelector('.project-card-desc') || card.querySelector('.project-desc');
      const tags = Array.from(card.querySelectorAll('.proj-tag, .project-tag')).map(t => t.textContent.toLowerCase());
      
      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const desc = descEl ? descEl.textContent.toLowerCase() : '';
      
      const matches = title.includes(filterText) || desc.includes(filterText) || tags.some(t => t.includes(filterText));
      card.style.display = matches ? 'block' : 'none';
    });
  }

  if (siriInput) {
    siriInput.addEventListener('input', (e) => {
      const query = e.target.value;
      if (query.trim() !== '') {
        switchView('projects');
        filterProjects(query);
      }
    });
  }

  if (widgetSearchInput) {
    widgetSearchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      filterProjects(query);
    });
  }

  // YouTube Project Quick Filters
  const ytFilters = document.querySelectorAll('.yt-link');
  ytFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      ytFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      // Switch to projects view shelf
      switchView('projects');

      // Update the main filter tabs
      const mainFilterBtns = document.querySelectorAll('.filter-chip, .filter-btn');
      mainFilterBtns.forEach(fBtn => {
        const cat = fBtn.getAttribute('data-filter');
        if (cat === filter) {
          fBtn.click();
        }
      });
    });
  });

  // Projects View Shelf Filter tabs
  const mainFilterBtns = document.querySelectorAll('.filter-chip, .filter-btn');
  mainFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mainFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'block';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- Skills Progress Bars ---
  const skillFills = document.querySelectorAll('.prof-bar-fill');
  let skillsAnimated = false;

  function animateSkillsProgress() {
    if (skillsAnimated) return;
    skillsAnimated = true;
    skillFills.forEach(bar => {
      const percent = bar.getAttribute('data-percent');
      bar.style.width = percent;
    });
  }

  // --- Siri Waveform Mic animation ---
  const siriOrb = document.querySelector('.siri-orb');
  if (siriOrb) {
    siriOrb.addEventListener('click', () => {
      showToast('Siri Active', 'Listening for study topics...', 'info');
      siriOrb.style.animation = 'siri-pulse 1s infinite alternate';
      setTimeout(() => {
        siriOrb.style.animation = 'siri-pulse 4s infinite alternate';
      }, 4000);
    });
  }

  // --- Top Bell Notification Dropdown Toggle ---
  const bellBtn = document.getElementById('top-bell-btn');
  const notifPanel = document.getElementById('spatial-notification-panel');
  const clearNotif = document.getElementById('clear-notifications');

  if (bellBtn && notifPanel) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!notifPanel.contains(e.target) && e.target !== bellBtn) {
        notifPanel.classList.remove('open');
      }
    });
  }

  if (clearNotif) {
    clearNotif.addEventListener('click', () => {
      const list = document.querySelector('.notification-list');
      if (list) {
        list.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.75rem;">No notifications.</div>`;
        const badge = document.querySelector('.bell-badge');
        if (badge) badge.style.display = 'none';
        showToast('Cleaned', 'Clear notifications.');
      }
    });
  }

  // --- Integrated Developer Dashboard Widgets ---
  window.isOverclocked = false;

  // 1. Featured Project Card
  const featuredToggle = document.getElementById('featured-project-toggle');
  const featuredCompletion = document.getElementById('featured-completion-val');
  const featuredSliderFill = document.getElementById('featured-slider-fill');
  const featuredStatusText = document.getElementById('featured-status-text');
  const featuredDemoLink = document.getElementById('featured-demo-link');

  if (featuredToggle) {
    featuredToggle.addEventListener('change', (e) => {
      const active = e.target.checked;
      const card = featuredToggle.closest('.pane-card');
      if (active) {
        card.style.opacity = '1';
        if (featuredSliderFill) featuredSliderFill.style.background = 'linear-gradient(to right, #ff7b00, #ffb700, #00d2ff)';
        if (featuredStatusText) featuredStatusText.textContent = 'Opened • 4 Active Modules';
        if (featuredDemoLink) featuredDemoLink.style.pointerEvents = 'auto';
        showToast('Featured Project', 'MeyTool Web Suite activated.', 'success');
      } else {
        card.style.opacity = '0.5';
        if (featuredStatusText) featuredStatusText.textContent = 'Closed • Inactive Modules';
        if (featuredDemoLink) featuredDemoLink.style.pointerEvents = 'none';
        showToast('Featured Project', 'MeyTool Web Suite deactivated.', 'warning');
      }
    });
  }

  // 2. Focus Coding Mode Card (AC Style)
  const focusToggle = document.getElementById('focus-mode-toggle');
  const focusTempVal = document.getElementById('focus-temp-value');
  const focusTempUp = document.getElementById('focus-temp-up');
  const focusTempDown = document.getElementById('focus-temp-down');
  const focusStatusText = document.getElementById('focus-status-text');
  const focusIconEmoji = document.getElementById('focus-icon-emoji');
  
  const overclockToggle = document.getElementById('overclock-toggle');
  const overclockLabel = document.getElementById('overclock-label');
  const vinylRecord = document.getElementById('music-vinyl');

  let focusTemp = 16;
  let isFocusActive = true;

  function updateFocusUI() {
    if (!focusTempVal) return;
    focusTempVal.textContent = focusTemp;
    if (isFocusActive) {
      if (focusTemp <= 20) {
        if (focusStatusText) focusStatusText.textContent = 'Cool Coding Temp';
        if (focusIconEmoji) focusIconEmoji.textContent = '❄️';
      } else if (focusTemp <= 26) {
        if (focusStatusText) focusStatusText.textContent = 'Optimal Focus Temp';
        if (focusIconEmoji) focusIconEmoji.textContent = '🍃';
      } else {
        if (focusStatusText) focusStatusText.textContent = 'Warm Server Temp';
        if (focusIconEmoji) focusIconEmoji.textContent = '🔥';
      }
    }
  }

  if (focusToggle) {
    focusToggle.addEventListener('change', (e) => {
      isFocusActive = e.target.checked;
      const card = focusToggle.closest('.pane-card');
      const tempControls = card.querySelector('.temp-display-row');
      if (isFocusActive) {
        card.style.opacity = '1';
        if (tempControls) tempControls.style.opacity = '1';
        updateFocusUI();
        showToast('Coding Mode', 'Focus mode active.', 'success');
      } else {
        card.style.opacity = '0.5';
        if (tempControls) tempControls.style.opacity = '0.3';
        if (focusStatusText) focusStatusText.textContent = 'Off • Idle Mode';
        if (focusIconEmoji) focusIconEmoji.textContent = '💤';
        showToast('Coding Mode', 'Focus mode deactivated.', 'warning');
      }
    });
  }

  if (focusTempUp) {
    focusTempUp.addEventListener('click', () => {
      if (!isFocusActive) return;
      if (focusTemp < 32) {
        focusTemp++;
        updateFocusUI();
      }
    });
  }

  if (focusTempDown) {
    focusTempDown.addEventListener('click', () => {
      if (!isFocusActive) return;
      if (focusTemp > 16) {
        focusTemp--;
        updateFocusUI();
      }
    });
  }

  if (overclockToggle) {
    overclockToggle.addEventListener('change', (e) => {
      window.isOverclocked = e.target.checked;
      if (window.isOverclocked) {
        if (vinylRecord) vinylRecord.classList.add('overclocked');
        showToast('Overclock Mode', 'Speed limit 6x active! Web Gateway accelerated.', 'info');
      } else {
        if (vinylRecord) vinylRecord.classList.remove('overclocked');
        showToast('Overclock Mode', 'Speed limit restored to normal (1x).', 'info');
      }
    });
  }

  // 3. Coding Music Player Widget
  const playPauseBtn = document.getElementById('music-play-pause');
  const playIcon = playPauseBtn ? playPauseBtn.querySelector('.play-icon') : null;
  const pauseIcon = playPauseBtn ? playPauseBtn.querySelector('.pause-icon') : null;
  const progressBar = document.getElementById('music-progress-bar');
  const currentTime = document.getElementById('music-current-time');
  const totalTime = document.getElementById('music-total-time');
  const progressBarClickable = document.getElementById('music-progress-clickable');

  let isPlaying = true;
  let codeSeconds = 105; // 01:45
  const maxSeconds = 180; // 03:00

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Timer loop for simulation
  const musicTimer = setInterval(() => {
    if (isPlaying) {
      codeSeconds++;
      if (codeSeconds > maxSeconds) {
        codeSeconds = 0;
      }
      if (currentTime) currentTime.textContent = formatTime(codeSeconds);
      if (progressBar) {
        progressBar.style.width = `${(codeSeconds / maxSeconds) * 100}%`;
      }
    }
  }, 1000);

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        if (vinylRecord) vinylRecord.classList.add('playing');
        showToast('Resume Code Track', 'Studying MeyTool Suite...', 'success');
      } else {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (vinylRecord) vinylRecord.classList.remove('playing');
        showToast('Pause Code Track', 'Study progress paused.', 'warning');
      }
    });
  }

  if (progressBarClickable) {
    progressBarClickable.addEventListener('click', (e) => {
      const rect = progressBarClickable.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      codeSeconds = Math.floor(pct * maxSeconds);
      if (currentTime) currentTime.textContent = formatTime(codeSeconds);
      if (progressBar) progressBar.style.width = `${pct * 100}%`;
    });
  }

  // Music controls visual feed toasts (null-guarded)
  const musicPrev = document.getElementById('music-prev');
  if (musicPrev) musicPrev.onclick = () => showToast('Previous Track', 'Opening previous design model.');
  const musicNext = document.getElementById('music-next');
  if (musicNext) musicNext.onclick = () => showToast('Next Track', 'Proceeding to next development sprint.');

  // 4. Webhook Server Gateway Widget
  const serverToggle = document.getElementById('server-power-toggle');
  const serverUpload = document.getElementById('server-upload-speed');
  const serverDownload = document.getElementById('server-download-speed');
  const serverIndicator = document.getElementById('server-wifi-indicator');
  const serverDeviceCount = document.getElementById('server-device-count');

  let isServerOnline = true;
  let serverStatsTimer = null;

  function runServerTraffic() {
    serverStatsTimer = setInterval(() => {
      if (isServerOnline) {
        const upSpeed = (Math.random() * 3 + 4).toFixed(1); // 4.0 - 7.0
        const downSpeed = (Math.random() * 3 + 5).toFixed(1); // 5.0 - 8.0
        if (serverUpload) serverUpload.textContent = `${upSpeed} MB/s`;
        if (serverDownload) serverDownload.textContent = `${downSpeed} MB/s`;
      }
    }, 1200);
  }

  if (serverToggle) {
    serverToggle.addEventListener('change', (e) => {
      isServerOnline = e.target.checked;
      const card = serverToggle.closest('.pane-card');
      if (isServerOnline) {
        card.style.opacity = '1';
        if (serverIndicator) {
          serverIndicator.textContent = '📶 Online';
          serverIndicator.style.color = 'var(--online-color)';
        }
        if (serverDeviceCount) serverDeviceCount.textContent = '3 Active Bots';
        runServerTraffic();
        showToast('Bot Server Gateway', 'Webhook host online.', 'success');
      } else {
        card.style.opacity = '0.5';
        if (serverIndicator) {
          serverIndicator.textContent = '🔴 Offline';
          serverIndicator.style.color = 'var(--text-muted)';
        }
        clearInterval(serverStatsTimer);
        if (serverUpload) serverUpload.textContent = '0.0 MB/s';
        if (serverDownload) serverDownload.textContent = '0.0 MB/s';
        if (serverDeviceCount) serverDeviceCount.textContent = '0 Active Bots';
        showToast('Bot Server Gateway', 'Webhook host stopped.', 'warning');
      }
    });
  }

  runServerTraffic();

  // 5. Code Quality Lint Monitor Widget
  const qaToggle = document.getElementById('qa-monitor-toggle');
  const qaBadge = document.getElementById('qa-badge-title');
  const qaWarnings = document.getElementById('qa-warnings-value');
  const qaStatusText = document.getElementById('qa-status-text');

  if (qaToggle) {
    qaToggle.addEventListener('change', (e) => {
      const active = e.target.checked;
      const card = qaToggle.closest('.pane-card');
      if (active) {
        card.style.opacity = '1';
        if (qaBadge) {
          qaBadge.textContent = 'Good Code Quality';
          qaBadge.style.background = '#34C759';
          qaBadge.style.boxShadow = '0 2px 5px rgba(52, 199, 89, 0.15)';
        }
        if (qaWarnings) qaWarnings.textContent = '21';
        if (qaStatusText) qaStatusText.textContent = 'Auto-Format: Active';
        showToast('Lint Monitor', 'Code analysis restarted.', 'success');
      } else {
        card.style.opacity = '0.5';
        if (qaBadge) {
          qaBadge.textContent = 'Lint Paused';
          qaBadge.style.background = 'var(--text-muted)';
          qaBadge.style.boxShadow = 'none';
        }
        if (qaWarnings) qaWarnings.textContent = '--';
        if (qaStatusText) qaStatusText.textContent = 'Auto-Format: Off';
        showToast('Lint Monitor', 'Code check paused.', 'warning');
      }
    });
  }

  // 6. Hire Status Availability Widget
  const hireToggle = document.getElementById('hire-power-toggle');
  const hireTitle = document.getElementById('hire-title-text');
  const hireFingerprint = document.getElementById('hire-fingerprint-btn');
  const fingerprintLabel = document.getElementById('fingerprint-status-label');
  const hireStatusText = document.getElementById('hire-status-text');
  const hireLockIcon = document.getElementById('hire-lock-icon');

  let isHireActive = true;

  if (hireToggle) {
    hireToggle.addEventListener('change', (e) => {
      isHireActive = e.target.checked;
      const card = hireToggle.closest('.pane-card');
      if (isHireActive) {
        card.style.opacity = '1';
        if (hireFingerprint) hireFingerprint.style.opacity = '1';
        if (hireTitle) hireTitle.textContent = 'Open to Work';
        if (hireStatusText) hireStatusText.textContent = 'Secure Line Available';
        if (hireLockIcon) hireLockIcon.textContent = '🔓';
        showToast('Hire Status', 'Open to collaborations.', 'success');
      } else {
        card.style.opacity = '0.5';
        if (hireFingerprint) hireFingerprint.style.opacity = '0.4';
        if (hireTitle) hireTitle.textContent = 'Unavailable';
        if (hireStatusText) hireStatusText.textContent = 'Secure Line Closed';
        if (hireLockIcon) hireLockIcon.textContent = '🔒';
        showToast('Hire Status', 'Set to offline / private.', 'warning');
      }
    });
  }

  if (hireFingerprint) {
    hireFingerprint.addEventListener('click', () => {
      if (!isHireActive) return;
      hireFingerprint.classList.add('scanning');
      if (fingerprintLabel) fingerprintLabel.textContent = 'Scanning...';

      setTimeout(() => {
        hireFingerprint.classList.remove('scanning');
        if (fingerprintLabel) fingerprintLabel.textContent = 'Email Copied!';
        navigator.clipboard.writeText('pichpenhbormey383@gmail.com');
        showToast('Identity Verified', 'Email pichpenhbormey383@gmail.com copied to clipboard!', 'success');
        
        setTimeout(() => {
          if (fingerprintLabel) fingerprintLabel.textContent = 'Tap to Copy Email';
        }, 2000);
      }, 900);
    });
  }

  // 7. Skills Controllers Logic (Sliders and Segment Controls)
  const skillSliders = document.querySelectorAll('.skill-range-slider');
  const skillGlowToggles = document.querySelectorAll('.skill-glow-toggle');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Sync range inputs with level labels
  skillSliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const skillName = e.target.getAttribute('data-skill');
      const val = e.target.value;
      const label = document.getElementById(`skill-lbl-${skillName}`);
      if (label) {
        label.textContent = `${val}% Level`;
      }
      
      // Update custom visual bar fill on featured card if it matches completion
      if (skillName === 'frontend' && val !== '95') {
        const featVal = document.getElementById('featured-completion-val');
        const featFill = document.getElementById('featured-slider-fill');
        if (featVal) featVal.textContent = `${val}%`;
        if (featFill) featFill.style.width = `${val}%`;
      }
    });
  });

  // Toggle glow styling
  skillGlowToggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const skillName = e.target.getAttribute('data-skill');
      const card = document.getElementById(`skill-card-${skillName}`);
      if (card) {
        card.classList.toggle('active-glow', e.target.checked);
      }
    });
  });

  // Wire preset buttons (A third, Half, All)
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const skillName = btn.getAttribute('data-skill');
      const val = btn.getAttribute('data-val');
      
      // Toggle active states on siblings
      const siblingBtns = document.querySelectorAll(`.preset-btn[data-skill="${skillName}"]`);
      siblingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update matching slider
      const slider = document.querySelector(`.skill-range-slider[data-skill="${skillName}"]`);
      if (slider) {
        slider.value = val;
        // Dispatch input event to trigger label update listener
        slider.dispatchEvent(new Event('input'));
      }
    });
  });
  // --- Quick Contact Drawer Actions ---
  // --- Null-safe onclick helper ---
  function safeOn(id, fn) {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  }

  // Dashboard quick actions (elements may not exist depending on active panel)
  safeOn('action-share', () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link Copied', 'Portfolio link copied to clipboard!');
  });
  safeOn('action-message', () => window.open('https://t.me/ShennCelest', '_blank'));
  safeOn('action-email', () => { window.location.href = 'mailto:pichpenhbormey383@gmail.com'; });
  safeOn('action-cv', () => {
    const codeBlock = document.getElementById('terminal-code-block');
    if (codeBlock) {
      navigator.clipboard.writeText(codeBlock.textContent);
      showToast('Copied', 'Resume JSON copied to notes!');
    }
  });
  safeOn('list-share-play', () => showToast('SharePlay', 'Initiating spatial session...'));
  safeOn('list-copy-email', () => {
    navigator.clipboard.writeText('pichpenhbormey383@gmail.com');
    showToast('Email Copied', 'pichpenhbormey383@gmail.com copied!', 'success');
  });
  safeOn('list-print-cv', () => {
    showToast('Demo Mode', 'CV printing is disabled in the GitHub Pages demo.', 'warning');
  });
  safeOn('list-download-cv', () => {
    showToast('Demo Mode', 'CV download is disabled in the GitHub Pages demo.', 'warning');
  });
  // Resume toolbar buttons
  safeOn('cv-download-btn', () => {
    showToast('Demo Mode', 'CV download is disabled in the GitHub Pages demo.', 'warning');
  });
  safeOn('cv-print-btn', () => {
    showToast('Demo Mode', 'CV printing is disabled in the GitHub Pages demo.', 'warning');
  });

  // Contact form demo notice
  const contactForm = document.getElementById('contact-form-new');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Demo Mode', 'Message sending is disabled in the GitHub Pages demo.', 'warning');
    });
  }

  // --- Minimize dock action with spring-physics CSS class animation ---
  const minimizeBtn = document.getElementById('dock-minimize-btn');
  let isSpatialWindowHidden = false;
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      const spatialWin = document.querySelector('.spatial-window');
      if (!spatialWin) return;

      if (isSpatialWindowHidden) {
        // RESTORE: remove minimizing, add restoring, then clean up
        isSpatialWindowHidden = false;
        spatialWin.classList.remove('minimizing');
        spatialWin.style.pointerEvents = '';
        spatialWin.offsetHeight; // force reflow
        spatialWin.classList.add('restoring');
        spatialWin.addEventListener('animationend', () => {
          spatialWin.classList.remove('restoring');
        }, { once: true });
        minimizeBtn.classList.remove('active');
        minimizeBtn.title = 'Hide Interface';
        showToast('Window Restored', 'Spatial workspace is back.', 'success');
      } else {
        // MINIMIZE: add minimizing class, disable interaction after
        isSpatialWindowHidden = true;
        spatialWin.classList.remove('restoring');
        spatialWin.classList.add('minimizing');
        spatialWin.addEventListener('animationend', () => {
          if (isSpatialWindowHidden) spatialWin.style.pointerEvents = 'none';
        }, { once: true });
        minimizeBtn.classList.add('active');
        minimizeBtn.title = 'Restore Interface';
        showToast('Window Minimized', 'Click minimize button to restore.', 'info');
      }
    });
  }

  // --- Expandable Coursework & Tool Accordion Drawers ---
  const eduTrigger = document.getElementById('edu-card-trigger');
  const expTrigger = document.getElementById('exp-card-trigger');
  const eduDrawer = document.getElementById('edu-cv-drawer');
  const expDrawer = document.getElementById('exp-cv-drawer');

  if (eduTrigger && eduDrawer) {
    eduTrigger.addEventListener('click', (e) => {
      if (e.target.closest('.cv-expanded-drawer')) return;
      const isOpen = eduDrawer.classList.contains('open');
      eduDrawer.classList.toggle('open', !isOpen);
      eduTrigger.classList.toggle('drawer-open', !isOpen);
    });
  }

  if (expTrigger && expDrawer) {
    expTrigger.addEventListener('click', (e) => {
      if (e.target.closest('.cv-expanded-drawer')) return;
      const isOpen = expDrawer.classList.contains('open');
      expDrawer.classList.toggle('open', !isOpen);
      expTrigger.classList.toggle('drawer-open', !isOpen);
    });
  }

  // --- Resume View Switcher (Visual vs JSON) ---
  const btnVisual = document.getElementById('btn-view-visual');
  const btnTerminal = document.getElementById('btn-view-terminal');
  const visualArea = document.getElementById('resume-sheet-area');
  const terminalArea = document.getElementById('resume-terminal-area');
  const segmentActivePill = document.getElementById('segment-active-pill');

  function updateResumeSegmentPill(activeBtn) {
    if (!segmentActivePill || !activeBtn) return;
    segmentActivePill.style.left = `${activeBtn.offsetLeft}px`;
    segmentActivePill.style.width = `${activeBtn.offsetWidth}px`;
  }

  if (btnVisual && btnTerminal) {
    btnVisual.addEventListener('click', () => {
      btnVisual.classList.add('active');
      btnTerminal.classList.remove('active');
      updateResumeSegmentPill(btnVisual);
      visualArea.style.display = 'block';
      terminalArea.style.display = 'none';
    });

    btnTerminal.addEventListener('click', () => {
      btnTerminal.classList.add('active');
      btnVisual.classList.remove('active');
      updateResumeSegmentPill(btnTerminal);
      visualArea.style.display = 'none';
      terminalArea.style.display = 'block';
    });
  }

  // --- CyberTools Floating macOS-style Window ---
  const cybertoolsOverlay = document.getElementById('cybertools-overlay');
  const cybertoolsIframe = document.getElementById('cybertools-iframe');
  const cybertoolsClose = document.getElementById('cybertools-close-btn');
  const cybertoolsMin = document.getElementById('cybertools-min-btn');
  const cybertoolsMax = document.getElementById('cybertools-max-btn');
  const dockCyberBtn = document.getElementById('dock-cybertools-btn');

  function openCybertoolsWindow() {
    if (!cybertoolsOverlay || !cybertoolsIframe) return;
    const iframeSrc = cybertoolsIframe.getAttribute('src');
    if (!iframeSrc || iframeSrc === '' || iframeSrc === '#') {
      const targetSrc = cybertoolsIframe.getAttribute('data-src');
      cybertoolsIframe.setAttribute('src', targetSrc);
    }
    cybertoolsOverlay.classList.add('open');
  }

  function openCybertoolsWithCategory(categoryName) {
    openCybertoolsWindow();
    // Message the iframe to change active category
    setTimeout(() => {
      if (cybertoolsIframe.contentWindow) {
        cybertoolsIframe.contentWindow.postMessage({ action: 'setCategory', category: categoryName }, '*');
      }
    }, 600);
  }

  if (dockCyberBtn) {
    dockCyberBtn.addEventListener('click', () => {
      dockCyberBtn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        dockCyberBtn.style.transform = '';
      }, 100);
      openCybertoolsWindow();
    });
  }

  // Close CyberTools overlay with closing animation
  function closeCybertoolsWindow() {
    if (!cybertoolsOverlay) return;
    cybertoolsOverlay.classList.add('closing');
    setTimeout(() => {
      cybertoolsOverlay.classList.remove('open');
      cybertoolsOverlay.classList.remove('closing');
    }, 420);
  }

  if (cybertoolsClose) cybertoolsClose.addEventListener('click', closeCybertoolsWindow);
  if (cybertoolsMin) cybertoolsMin.addEventListener('click', closeCybertoolsWindow);
  if (cybertoolsMax) {
    cybertoolsMax.addEventListener('click', () => {
      const win = cybertoolsOverlay.querySelector('.glass-app-window');
      win.classList.toggle('maximized');
    });
  }

  // --- Toast Notification System ---
  function showToast(title, description, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke-width="2"/><path d="m9 12 2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    } else if (type === 'warning' || type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="14" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="3" stroke-linecap="round"/></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke-width="3" stroke-linecap="round"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-desc">${description}</span>
      </div>
    `;
    toastContainer.appendChild(toast);
    
    // Force repaint so CSS animation triggers
    toast.offsetHeight;
    toast.classList.add('show');
    
    setTimeout(() => {
      // Slide out with animation
      toast.classList.remove('show');
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 420);
    }, 3200);
  }

  // --- Loader Screen ---
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      setTimeout(() => {
        loaderScreen.classList.add('hidden');
        showToast('Portfolio Active', 'Responsive mobile and PC layout initialized.', 'success');
        showToast('Online Status', 'Bormey is active in Phnom Penh', 'info');
        setTimeout(() => {
          showToast('Demo Notice', 'Some functions (e.g. CV Download/Print, form submission) may not fully work on GitHub Pages.', 'warning');
        }, 1200);
      }, 500);
    }
    loaderProgress.textContent = `${progress}%`;
  }, 40);
  // --- Live Clock (Phnom Penh UTC+7) ---
  const clockEl = document.getElementById('live-clock-display');
  const apiLatEl = document.getElementById('api-latency-val');

  function updateClock() {
    const now = new Date();
    // UTC+7 offset
    const phnomPenhTime = new Date(now.getTime() + (7 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000));
    const h = String(phnomPenhTime.getHours()).padStart(2, '0');
    const m = String(phnomPenhTime.getMinutes()).padStart(2, '0');
    const s = String(phnomPenhTime.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `🕐 ${h}:${m}:${s}`;
    // Simulate API latency fluctuation
    if (apiLatEl && Math.random() < 0.1) {
      const latency = Math.floor(Math.random() * 8) + 8;
      apiLatEl.textContent = `${latency}ms`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --- Security Protection (Disable Right-click & DevTools) ---
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showToast('Protected', 'Right-click menu is disabled.', 'warning');
  });

  document.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.key === 'F12') {
      e.preventDefault();
      showToast('Protected', 'Developer Tools are disabled on this site.', 'warning');
    }
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      showToast('Protected', 'Source code viewing is disabled.', 'warning');
    }
    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      showToast('Protected', 'Page saving is disabled.', 'warning');
    }
    // Disable Ctrl+Shift+I, J, C (DevTools console/inspect)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      showToast('Protected', 'Developer Tools are disabled on this site.', 'warning');
    }
  });

  // Disable dragging on all images to protect profile photo
  document.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

});
