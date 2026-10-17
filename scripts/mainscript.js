import { initSettings, renderSettingsPage } from './settings.js';
import { renderAddstudentPage } from './add-students.js';
import { renderAddTeacherPage } from './add-teachers.js';
import { renderAddClassPage } from './add-classes.js';
import { renderAddSubjectPage } from './add-subjects.js';
import { renderAttendencePage, displayAttendanceView } from './attendence.js';
import { renderReportPage } from './report.js';

// Setup Nav Tab Highlighting
function setupNavigationHighlighting() {
  const topButtons = document.querySelectorAll('.top-nav-buttons');
  const bottomButtons = document.querySelectorAll('.bottom-nav-button');

  topButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      topButtons.forEach((b) => b.classList.remove('active'));
      bottomButtons.forEach((b) => {
        b.classList.remove('active');
        const svg = b.querySelector('.bottom-navbar-svg');
        if (svg) svg.classList.remove('active');
      });
      btn.classList.add('active');
    });
  });

  bottomButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      topButtons.forEach((b) => b.classList.remove('active'));
      bottomButtons.forEach((b) => {
        b.classList.remove('active');
        const svg = b.querySelector('.bottom-navbar-svg');
        if (svg) svg.classList.remove('active');
      });
      btn.classList.add('active');
      const svg = btn.querySelector('.bottom-navbar-svg');
      if (svg) svg.classList.add('active');
    });
  });
}

// Server Connection & Status Check
async function checkServerStatus() {
  const onlineTextEl = document.querySelector('.online-text');
  const onlineDiv = document.querySelector('.online-text-div');

  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      if (onlineTextEl) onlineTextEl.textContent = 'Online';
      if (onlineDiv) onlineDiv.style.opacity = '1';
    } else {
      if (onlineTextEl) onlineTextEl.textContent = 'Degraded';
    }
  } catch (e) {
    if (onlineTextEl) onlineTextEl.textContent = 'Offline';
    if (onlineDiv) onlineDiv.style.opacity = '0.6';
  }
}

// Initialize Application
async function initApp() {
  setupNavigationHighlighting();

  // Register listeners for all tabs
  renderAttendencePage();
  renderReportPage();
  renderSettingsPage();
  renderAddstudentPage();
  renderAddTeacherPage();
  renderAddClassPage();
  renderAddSubjectPage();

  // Load user settings (theme, display name)
  await initSettings();

  // Check health status
  await checkServerStatus();

  // Render initial attendance view with live MongoDB data
  await displayAttendanceView();
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
