import { api } from './api.js';

let state = {
  viewMode: 'class',       // 'class' | 'student'
  timeframe: 'year',       // 'year' | 'month'
  selectedMonth: '',       // 'YYYY-MM'
  selectedClass: '',
  selectedSubject: '',     // '' means All Subjects
  selectedStudentId: '',   // for single student view
  classes: [],
  subjects: [],
  students: [],
  attendanceRecords: []
};

export function renderReportPage() {
  const reportsNavbutton = document.querySelector('.js-reports-navbutton');
  if (!reportsNavbutton) return;

  reportsNavbutton.addEventListener('click', async () => {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    mainEl.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-muted, #666);">
        Loading attendance reports from database...
      </div>
    `;

    try {
      const [classes, subjects, students, attendance] = await Promise.all([
        api.getClasses(),
        api.getSubjects(),
        api.getStudents(),
        api.getAttendance()
      ]);

      state.classes = classes;
      state.subjects = subjects;
      state.students = students;
      state.attendanceRecords = attendance;

      // Set default selectedMonth to current YYYY-MM
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      state.selectedMonth = `${yr}-${mo}`;

      // Set default selectedClass
      if (!state.selectedClass && classes.length > 0) {
        state.selectedClass = classes[0].name;
      }

      renderReportView();
    } catch (err) {
      mainEl.innerHTML = `
        <div style="padding: 40px; text-align: center; color: red;">
          Error loading reports: ${err.message}
        </div>
      `;
    }
  });
}

function renderReportView() {
  const mainEl = document.querySelector('main');
  if (!mainEl) return;

  // Filter attendance records by timeframe and subject
  const filteredRecords = state.attendanceRecords.filter((rec) => {
    // Class filter
    if (state.selectedClass && rec.class && rec.class.toLowerCase() !== state.selectedClass.toLowerCase()) {
      return false;
    }

    // Timeframe filter (month: YYYY-MM vs year)
    if (state.timeframe === 'month' && state.selectedMonth) {
      if (!rec.date || !rec.date.startsWith(state.selectedMonth)) {
        return false;
      }
    }

    // Subject filter
    if (state.selectedSubject && rec.subject && rec.subject.toLowerCase() !== state.selectedSubject.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Class dropdown options
  let classOptionsHTML = '';
  state.classes.forEach((c) => {
    const isSel = state.selectedClass?.toLowerCase() === c.name.toLowerCase();
    classOptionsHTML += `<option value="${c.name}" ${isSel ? 'selected' : ''}>${c.name}</option>`;
  });

  // Subjects for the selected class (or all subjects)
  const classSubjects = state.subjects.filter((sub) => {
    if (!state.selectedClass) return true;
    return !sub.class || sub.class.toLowerCase() === state.selectedClass.toLowerCase();
  });

  let subjectOptionsHTML = '<option value="" ' + (!state.selectedSubject ? 'selected' : '') + '>All Subjects</option>';
  classSubjects.forEach((sub) => {
    const isSel = state.selectedSubject?.toLowerCase() === sub.name.toLowerCase();
    subjectOptionsHTML += `<option value="${sub.name}" ${isSel ? 'selected' : ''}>${sub.name}</option>`;
  });

  // Students in selected class
  const classStudents = state.students.filter((s) => {
    if (!state.selectedClass) return true;
    return (s.class || '').toLowerCase() === state.selectedClass.toLowerCase();
  });

  // Make sure a valid student is selected if in student mode
  if (state.viewMode === 'student') {
    if (!state.selectedStudentId && classStudents.length > 0) {
      state.selectedStudentId = classStudents[0]._id || classStudents[0].id || classStudents[0].name;
    }
  }

  let studentOptionsHTML = '';
  classStudents.forEach((std) => {
    const stdId = std._id || std.id || std.name;
    const isSel = String(state.selectedStudentId) === String(stdId) || state.selectedStudentId === std.name;
    studentOptionsHTML += `<option value="${stdId}" ${isSel ? 'selected' : ''}>${std.name} ${std.rollNo ? `(#${std.rollNo})` : ''}</option>`;
  });

  // Period label text
  let periodLabel = 'Whole Year / All Time';
  if (state.timeframe === 'month' && state.selectedMonth) {
    const [y, m] = state.selectedMonth.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1);
    periodLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  const reportsHTML = `
    <div class="reports-wrapper">
      <!-- Printable Official Header -->
      <div class="print-official-header">
        <div class="print-logo-title-wrap">
          <img class="print-logo-img" src="icons/attendence-icon-64.png" alt="Logo">
          <h1 class="print-inst-name">WACKHA HAJAR ACADEMY</h1>
        </div>
        <h2 class="print-doc-title">${state.viewMode === 'class' ? 'Class Attendance Performance Report' : 'Individual Student Attendance Report'}</h2>
        <div class="print-meta-grid">
          <div><strong>Class:</strong> ${state.selectedClass || 'All Classes'}</div>
          <div><strong>Subject:</strong> ${state.selectedSubject || 'All Subjects'}</div>
          <div><strong>Period:</strong> ${periodLabel}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
        </div>
      </div>

      <!-- Toggles & Mode Selection -->
      <div class="report-toggle-card">
        <div class="report-toggles-grid">
          <!-- View Mode: Whole Class vs Single Student -->
          <div class="report-segmented-control">
            <button class="report-seg-btn js-btn-view-class ${state.viewMode === 'class' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Whole Class Report
            </button>
            <button class="report-seg-btn js-btn-view-student ${state.viewMode === 'student' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Single Student Report
            </button>
          </div>

          <!-- Timeframe Mode: Whole Year vs Monthly -->
          <div class="report-segmented-control">
            <button class="report-seg-btn js-btn-tf-year ${state.timeframe === 'year' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
              All-Time / Whole Year
            </button>
            <button class="report-seg-btn js-btn-tf-month ${state.timeframe === 'month' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path></svg>
              Monthly Report
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="report-filters-card">
        <div class="report-filters-grid">
          <div class="report-filter-item">
            <label class="report-filter-label">Class</label>
            <select class="report-select js-filter-class">
              ${classOptionsHTML}
            </select>
          </div>

          <div class="report-filter-item">
            <label class="report-filter-label">Subject</label>
            <select class="report-select js-filter-subject">
              ${subjectOptionsHTML}
            </select>
          </div>

          ${state.timeframe === 'month' ? `
            <div class="report-filter-item">
              <label class="report-filter-label">Select Month</label>
              <input type="month" class="report-month-input js-filter-month" value="${state.selectedMonth}">
            </div>
          ` : ''}

          ${state.viewMode === 'student' ? `
            <div class="report-filter-item">
              <label class="report-filter-label">Student</label>
              <select class="report-select js-filter-student">
                ${studentOptionsHTML}
              </select>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Action Bar -->
      <div class="report-actions-row">
        <div class="report-period-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${periodLabel} ${state.selectedSubject ? `• ${state.selectedSubject}` : '• All Subjects'}
        </div>
        <button class="btn-print-report js-print-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>
          Print Report
        </button>
      </div>

      <!-- Main Report Content -->
      ${state.viewMode === 'class' ? renderClassReport(classStudents, filteredRecords) : renderStudentReport(classStudents, filteredRecords)}

      <!-- Print Signatures Footer -->
      <div class="print-signatures-footer">
        <div class="print-sig-col">
          <div class="print-sig-line"></div>
          <p class="print-sig-label">Class Incharge / Teacher</p>
        </div>
        <div class="print-sig-col">
          <div class="print-sig-line"></div>
          <p class="print-sig-label">Principal / Academic Head</p>
        </div>
      </div>
    </div>
  `;

  mainEl.innerHTML = reportsHTML;

  // Bind Listeners
  bindReportEvents();
}

// 1. Whole Class Report View
function renderClassReport(classStudents, filteredRecords) {
  if (classStudents.length === 0) {
    return `
      <div class="report-table-card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        No students found in class <strong>${state.selectedClass}</strong>.
      </div>
    `;
  }

  // Calculate per-student stats
  let totalAttendedAll = 0;
  let totalPossibleAll = 0;

  const studentStats = classStudents.map((std) => {
    let attended = 0;
    let missed = 0;

    filteredRecords.forEach((record) => {
      const entry = record.records?.find(
        (r) => String(r.studentId) === String(std._id || std.id) || r.studentName?.toLowerCase() === std.name?.toLowerCase()
      );
      if (entry) {
        if (entry.status === 'present') attended++;
        else missed++;
      }
    });

    const total = attended + missed;
    const pct = total > 0 ? Math.round((attended / total) * 100) : 0;

    totalAttendedAll += attended;
    totalPossibleAll += total;

    return {
      student: std,
      attended,
      missed,
      total,
      pct
    };
  });

  const classAvg = totalPossibleAll > 0 ? Math.round((totalAttendedAll / totalPossibleAll) * 100) : 0;
  const totalSessions = filteredRecords.length;

  let tableRowsHTML = '';
  studentStats.forEach((s, idx) => {
    const std = s.student;
    const badgeClass = s.pct >= 85 ? 'green' : (s.pct >= 70 ? 'amber' : 'red');
    const photo = std.photo || 'images/nooru.jpeg';
    const stdId = std._id || std.id || std.name;

    tableRowsHTML += `
      <tr>
        <td style="font-weight: 600; color: var(--text-muted);">${std.rollNo || (idx + 1)}</td>
        <td>
          <div class="student-col-info">
            <img class="student-col-avatar" src="${photo}" alt="${std.name}">
            <div>
              <strong>${std.name}</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${std.class || ''}</div>
            </div>
          </div>
        </td>
        <td>${s.total}</td>
        <td style="color: #10b981; font-weight: 600;">${s.attended}</td>
        <td style="color: #ef4444; font-weight: 600;">${s.missed}</td>
        <td>
          <span class="badge-percent ${badgeClass}">${s.pct}%</span>
        </td>
        <td>
          <button class="btn-view-student js-btn-view-student-detail" data-id="${stdId}">
            View Details
          </button>
        </td>
      </tr>
    `;
  });

  return `
    <!-- Class KPI Summary Cards -->
    <div class="report-kpi-grid">
      <div class="report-kpi-card">
        <div class="report-kpi-val text-primary">${classStudents.length}</div>
        <div class="report-kpi-lbl">Total Students</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val">${totalSessions}</div>
        <div class="report-kpi-lbl">Sessions Recorded</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val text-green">${totalAttendedAll}</div>
        <div class="report-kpi-lbl">Total Presences</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val ${classAvg >= 80 ? 'text-green' : (classAvg >= 65 ? 'text-primary' : 'text-red')}">${classAvg}%</div>
        <div class="report-kpi-lbl">Class Average</div>
      </div>
    </div>

    <!-- Class Students Table -->
    <div class="report-table-card">
      <div class="report-table-header">
        <span class="report-table-title">Students Attendance Breakdown (${state.selectedClass})</span>
        <span style="font-size: 12px; color: var(--text-muted);">${studentStats.length} Enrolled</span>
      </div>
      <div class="report-table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 50px;">Roll</th>
              <th>Student Name</th>
              <th>Total</th>
              <th>Attended</th>
              <th>Missed</th>
              <th>Attendance %</th>
              <th style="width: 100px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. Individual Single Student Report View
function renderStudentReport(classStudents, filteredRecords) {
  const currentStudent = classStudents.find(
    (s) => String(s._id || s.id) === String(state.selectedStudentId) || s.name === state.selectedStudentId
  ) || classStudents[0];

  if (!currentStudent) {
    return `
      <div class="report-table-card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        Please select a valid student.
      </div>
    `;
  }

  let attended = 0;
  let missed = 0;
  const subjectMap = {};
  const historyLogs = [];

  filteredRecords.forEach((record) => {
    const entry = record.records?.find(
      (r) => String(r.studentId) === String(currentStudent._id || currentStudent.id) || r.studentName?.toLowerCase() === currentStudent.name?.toLowerCase()
    );

    if (entry) {
      const isPresent = entry.status === 'present';
      if (isPresent) attended++;
      else missed++;

      const subName = record.subject || 'General';
      if (!subjectMap[subName]) {
        subjectMap[subName] = { attended: 0, missed: 0, total: 0 };
      }
      subjectMap[subName].total++;
      if (isPresent) subjectMap[subName].attended++;
      else subjectMap[subName].missed++;

      historyLogs.push({
        date: record.date,
        subject: record.subject,
        status: entry.status
      });
    }
  });

  const totalClasses = attended + missed;
  const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;
  const photo = currentStudent.photo || 'images/nooru.jpeg';

  // Subject rows
  let subjectRowsHTML = '';
  Object.keys(subjectMap).forEach((sub) => {
    const item = subjectMap[sub];
    const subPct = item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0;
    const badgeClass = subPct >= 85 ? 'green' : (subPct >= 70 ? 'amber' : 'red');

    subjectRowsHTML += `
      <tr>
        <td><strong>${sub}</strong></td>
        <td>${item.total}</td>
        <td style="color: #10b981; font-weight: 600;">${item.attended}</td>
        <td style="color: #ef4444; font-weight: 600;">${item.missed}</td>
        <td><span class="badge-percent ${badgeClass}">${subPct}%</span></td>
      </tr>
    `;
  });

  // History rows (up to 15 recent)
  let historyRowsHTML = '';
  historyLogs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15).forEach((log) => {
    const isP = log.status === 'present';
    historyRowsHTML += `
      <tr>
        <td>${log.date}</td>
        <td>${log.subject}</td>
        <td>
          <span class="badge-percent ${isP ? 'green' : 'red'}">${isP ? 'Present' : 'Absent'}</span>
        </td>
      </tr>
    `;
  });

  return `
    <button class="btn-back-to-class js-btn-back-to-class">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      Back to Class Overview
    </button>

    <!-- Student Hero Card -->
    <div class="student-detail-hero">
      <img class="student-detail-avatar" src="${photo}" alt="${currentStudent.name}">
      <div class="student-detail-info">
        <h3 class="student-detail-name">${currentStudent.name}</h3>
        <p class="student-detail-meta">Class: <strong>${currentStudent.class || 'N/A'}</strong> ${currentStudent.rollNo ? `• Roll No: <strong>#${currentStudent.rollNo}</strong>` : ''}</p>
        <p class="student-detail-meta" style="margin-top: 2px;">ID: ${currentStudent.id || currentStudent._id || 'N/A'}</p>
      </div>
      <div class="student-detail-circle">
        <div class="student-detail-pct ${percentage >= 80 ? 'text-green' : (percentage >= 65 ? 'text-primary' : 'text-red')}">${percentage}%</div>
        <div class="student-detail-pct-lbl">Attendance Rate</div>
      </div>
    </div>

    <!-- Student KPI Cards -->
    <div class="report-kpi-grid">
      <div class="report-kpi-card">
        <div class="report-kpi-val">${totalClasses}</div>
        <div class="report-kpi-lbl">Total Sessions</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val text-green">${attended}</div>
        <div class="report-kpi-lbl">Attended</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val text-red">${missed}</div>
        <div class="report-kpi-lbl">Missed</div>
      </div>
      <div class="report-kpi-card">
        <div class="report-kpi-val text-primary">${Object.keys(subjectMap).length}</div>
        <div class="report-kpi-lbl">Subjects Tracked</div>
      </div>
    </div>

    <!-- Subject Breakdown Table -->
    <div class="report-table-card">
      <div class="report-table-header">
        <span class="report-table-title">Subject-wise Attendance Breakdown</span>
      </div>
      <div class="report-table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Total</th>
              <th>Attended</th>
              <th>Missed</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${subjectRowsHTML || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No records found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Attendance Log -->
    <div class="report-table-card">
      <div class="report-table-header">
        <span class="report-table-title">Recent Attendance Records (Last 15 Sessions)</span>
      </div>
      <div class="report-table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${historyRowsHTML || '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No attendance recorded yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Bind Event Listeners
function bindReportEvents() {
  // 1. View Mode Toggles
  const btnClassView = document.querySelector('.js-btn-view-class');
  const btnStudentView = document.querySelector('.js-btn-view-student');

  if (btnClassView) {
    btnClassView.addEventListener('click', () => {
      state.viewMode = 'class';
      renderReportView();
    });
  }

  if (btnStudentView) {
    btnStudentView.addEventListener('click', () => {
      state.viewMode = 'student';
      renderReportView();
    });
  }

  // 2. Timeframe Toggles
  const btnTfYear = document.querySelector('.js-btn-tf-year');
  const btnTfMonth = document.querySelector('.js-btn-tf-month');

  if (btnTfYear) {
    btnTfYear.addEventListener('click', () => {
      state.timeframe = 'year';
      renderReportView();
    });
  }

  if (btnTfMonth) {
    btnTfMonth.addEventListener('click', () => {
      state.timeframe = 'month';
      renderReportView();
    });
  }

  // 3. Class Filter Change
  const classSelect = document.querySelector('.js-filter-class');
  if (classSelect) {
    classSelect.addEventListener('change', (e) => {
      state.selectedClass = e.target.value;
      state.selectedSubject = ''; // reset subject on class change
      state.selectedStudentId = ''; // reset student
      renderReportView();
    });
  }

  // 4. Subject Filter Change
  const subSelect = document.querySelector('.js-filter-subject');
  if (subSelect) {
    subSelect.addEventListener('change', (e) => {
      state.selectedSubject = e.target.value;
      renderReportView();
    });
  }

  // 5. Month Filter Change
  const monthInput = document.querySelector('.js-filter-month');
  if (monthInput) {
    monthInput.addEventListener('change', (e) => {
      state.selectedMonth = e.target.value;
      renderReportView();
    });
  }

  // 6. Student Filter Change (in Single Student view)
  const studentSelect = document.querySelector('.js-filter-student');
  if (studentSelect) {
    studentSelect.addEventListener('change', (e) => {
      state.selectedStudentId = e.target.value;
      renderReportView();
    });
  }

  // 7. Click "View Details" on Class Table Row -> switch to single student
  document.querySelectorAll('.js-btn-view-student-detail').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedStudentId = btn.dataset.id;
      state.viewMode = 'student';
      renderReportView();
    });
  });

  // 8. Back to Class Overview
  const backBtn = document.querySelector('.js-btn-back-to-class');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.viewMode = 'class';
      renderReportView();
    });
  }

  // 9. Print Report
  const printBtn = document.querySelector('.js-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}