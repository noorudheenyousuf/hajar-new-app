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
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    mainEl.innerHTML = `
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
      console.error('Error fetching settings:', e);
    }

    const settingsHTML = `
      <div class="settings-wrapper">
        <!-- Profile / Display Name -->
        <div class="settings-card">
          <div class="settings-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <h3 class="settings-card-title">Profile Settings</h3>
          </div>
          <p class="settings-label">User Display Name</p>
          <div class="nameinput-savebutton">
            <input type="text" class="js-display-name-input" value="${savedName}" placeholder="Enter your display name">
            <button class="btn-primary-compact js-save-name-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Save
            </button>
          </div>
        </div>

        <!-- Appearance -->
        <div class="settings-card">
          <div class="settings-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
            <h3 class="settings-card-title">Appearance</h3>
          </div>
          <div class="theme-toggle-row">
            <button class="theme-btn js-light-mode-btn ${currentTheme === 'light' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              Light Mode
            </button>
            <button class="theme-btn js-dark-mode-btn ${currentTheme === 'dark' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              Dark Mode
            </button>
          </div>
          <button class="btn-secondary-compact js-fullscreen-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            Toggle Fullscreen
          </button>
        </div>

        <!-- Backup & Restore Data -->
        <div class="settings-card">
          <div class="settings-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <h3 class="settings-card-title">Backup & Restore</h3>
          </div>
          <p class="backup-info-text">Export all data (students, classes, subjects, attendance) to a JSON file or restore from a previous backup file.</p>
          <div class="backup-actions-row">
            <button class="backup-btn js-export-data-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export Data (.json)
            </button>
            <button class="backup-btn js-import-data-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Import Data (.json)
            </button>
            <input type="file" class="js-import-file-input" accept=".json,application/json" style="display: none;">
          </div>
        </div>

        <!-- Data Management / Reset -->
        <div class="settings-card">
          <div class="settings-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--danger);"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <h3 class="settings-card-title">Clear Attendance Records</h3>
          </div>
          <p class="danger-description">Deletes attendance log entries only. Classes, students, teachers, and subjects in MongoDB are preserved.</p>
          <button class="btn-danger-compact js-clear-attendance-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Clear Attendance Data
          </button>
        </div>

        <!-- Sign Out -->
        <div class="signout-container">
          <button class="btn-signout js-sign-out-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </div>
    `;

    mainEl.innerHTML = settingsHTML;

    // --- 1. Display Name Save ---
    const saveNameBtn = document.querySelector('.js-save-name-btn');
    const nameInput = document.querySelector('.js-display-name-input');
    if (saveNameBtn && nameInput) {
      saveNameBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
          alert('Please enter a valid display name.');
          return;
        }

        saveNameBtn.disabled = true;
        saveNameBtn.textContent = 'Saving...';
        try {
          await api.updateSettings({ displayName: name });
          updateHeaderName(name);
          alert('Display name updated successfully!');
        } catch (err) {
          alert(`Error saving display name: ${err.message}`);
        } finally {
          saveNameBtn.disabled = false;
          saveNameBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Save
          `;
        }
      });
    }

    // --- 2. Light / Dark Mode ---
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

    // --- 3. Toggle Fullscreen ---
    const fullscreenBtn = document.querySelector('.js-fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            alert(`Fullscreen error: ${err.message}`);
          });
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      });
    }

    // --- 4. Export Backup Data ---
    const exportBtn = document.querySelector('.js-export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        exportBtn.disabled = true;
        exportBtn.textContent = 'Exporting...';
        try {
          const backup = await api.exportBackup();
          const jsonStr = JSON.stringify(backup, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const dateStr = new Date().toISOString().slice(0, 10);
          a.href = url;
          a.download = `hajar_app_backup_${dateStr}.json`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } catch (err) {
          alert(`Error exporting data: ${err.message}`);
        } finally {
          exportBtn.disabled = false;
          exportBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Data (.json)
          `;
        }
      });
    }

    // --- 5. Import Backup Data ---
    const importBtn = document.querySelector('.js-import-data-btn');
    const fileInput = document.querySelector('.js-import-file-input');
    if (importBtn && fileInput) {
      importBtn.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const confirmRestore = confirm(`Importing "${file.name}" will restore database records from this backup file. Do you wish to continue?`);
        if (!confirmRestore) {
          fileInput.value = '';
          return;
        }

        importBtn.disabled = true;
        importBtn.textContent = 'Importing...';

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            const res = await api.importBackup(parsed);
            alert(res.message || 'Data restored successfully!');
            location.reload();
          } catch (err) {
            alert(`Error importing backup: ${err.message}`);
          } finally {
            importBtn.disabled = false;
            importBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Import Data (.json)
            `;
            fileInput.value = '';
          }
        };
        reader.readAsText(file);
      });
    }

    // --- 6. Clear Attendance Data ---
    const clearDataBtn = document.querySelector('.js-clear-attendance-btn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', async () => {
        const confirmDelete = confirm('Are you sure you want to delete all attendance records? This action cannot be undone.');
        if (!confirmDelete) return;

        clearDataBtn.disabled = true;
        try {
          await api.clearAttendance();
          alert('All attendance records have been cleared from MongoDB!');
        } catch (err) {
          alert(`Error clearing attendance: ${err.message}`);
        } finally {
          clearDataBtn.disabled = false;
        }
      });
    }

    // --- 7. Sign Out ---
    const signOutBtn = document.querySelector('.js-sign-out-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        const confirmSignOut = confirm('Are you sure you want to sign out?');
        if (confirmSignOut) {
          location.reload();
        }
      });
    }
  });
}