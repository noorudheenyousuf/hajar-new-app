import { api } from './api.js';

export async function initSettings() {
  try {
    const settings = await api.getSettings();
    if (settings) {
      if (settings.displayName) {
        updateHeaderName(settings.displayName);
      }
      if (settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  } catch (error) {
    console.warn('Could not initialize settings from server:', error.message);
  }
}

function updateHeaderName(name) {
  const headerNameEl = document.querySelector('.js-header-profile-name');
  if (headerNameEl && name) {
    headerNameEl.textContent = name;
  }
}

export function renderSettingsPage() {
  const settingsNavbutton = document.querySelector('.js-settings-navbutton');
  if (!settingsNavbutton) return;

  settingsNavbutton.addEventListener('click', async () => {
    document.querySelector('main').innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-muted, #666);">
        Loading settings...
      </div>
    `;

    let savedName = '';
    let currentTheme = 'light';

    try {
      const settings = await api.getSettings();
      if (settings) {
        savedName = settings.displayName || '';
        currentTheme = settings.theme || 'light';
      }
    } catch (e) {
      console.error(e);
    }

    const settingsPageHTML = `
      <div class="profile-container">
        <div class="profile-div">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user" style="color: var(--primary);"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <p>Profile</p>
        </div>
        <p>Display name</p>
        <div class="nameinput-savebutton">
          <input type="text" class="js-display-name-input" value="${savedName}" placeholder="Enter your name">
          <button class="js-save-name-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>
            Save
          </button>
        </div>
      </div>

      <div class="appearance-container">
        <div class="appearence-title-icon-div">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
          <p>Appearance</p>
        </div>
        <div class="light-dark-button-div">
          <button class="js-light-mode-btn ${currentTheme === 'light' ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
            Light
          </button>
          <button class="js-dark-mode-btn ${currentTheme === 'dark' ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path></svg>
            Dark
          </button>
        </div>
        <button class="fullscreen-button js-fullscreen-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize2"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
          Toggle Fullscreen
        </button>
      </div>

      <div class="data-management-container">
        <div class="data-managment-title-icon-div">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database" style="color: var(--primary);"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
          Data Management
        </div>
        <p class="delete-description">Delete attendance records only. Classes, students, subjects, and teachers in MongoDB are preserved.</p>
        <button class="js-clear-attendance-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2" style="color: var(--red);"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Clear Attendance Data
        </button>
      </div>

      <div class="sign-out-div">
        <button class="sign-out-button js-sign-out-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path></svg>
          Sign Out
        </button>
      </div>
    `;

    document.querySelector('main').innerHTML = settingsPageHTML;

    // --- 1. Display Name Save Event ---
    const saveNameBtn = document.querySelector('.js-save-name-btn');
    const nameInput = document.querySelector('.js-display-name-input');
    if (saveNameBtn && nameInput) {
      saveNameBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (name) {
          saveNameBtn.disabled = true;
          try {
            await api.updateSettings({ displayName: name });
            updateHeaderName(name);
            alert('Display name saved successfully to MongoDB!');
          } catch (err) {
            alert(`Error saving name: ${err.message}`);
          } finally {
            saveNameBtn.disabled = false;
          }
        } else {
          alert('Please enter a valid name.');
        }
      });
    }

    // --- 2. Light / Dark Mode Toggle Event ---
    const lightBtn = document.querySelector('.js-light-mode-btn');
    const darkBtn = document.querySelector('.js-dark-mode-btn');

    if (lightBtn && darkBtn) {
      lightBtn.addEventListener('click', async () => {
        document.body.classList.remove('dark-theme');
        lightBtn.classList.add('active');
        darkBtn.classList.remove('active');
        try {
          await api.updateSettings({ theme: 'light' });
        } catch (e) {
          console.error(e);
        }
      });

      darkBtn.addEventListener('click', async () => {
        document.body.classList.add('dark-theme');
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
        try {
          await api.updateSettings({ theme: 'dark' });
        } catch (e) {
          console.error(e);
        }
      });
    }

    // --- 3. Toggle Fullscreen Event ---
    const fullscreenBtn = document.querySelector('.js-fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      });
    }

    // --- 4. Clear Attendance Data Event ---
    const clearDataBtn = document.querySelector('.js-clear-attendance-btn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', async () => {
        const confirmDelete = confirm('Are you sure you want to delete all attendance records from MongoDB? This action cannot be undone.');
        if (confirmDelete) {
          clearDataBtn.disabled = true;
          try {
            await api.clearAttendance();
            alert('All attendance records have been cleared from MongoDB!');
          } catch (err) {
            alert(`Error clearing attendance: ${err.message}`);
          } finally {
            clearDataBtn.disabled = false;
          }
        }
      });
    }

    // --- 5. Sign Out Event ---
    const signOutBtn = document.querySelector('.js-sign-out-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        const confirmSignOut = confirm('Are you sure you want to sign out?');
        if (confirmSignOut) {
          alert('Signed out successfully!');
          location.reload();
        }
      });
    }
  });
}