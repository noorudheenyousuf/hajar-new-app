import { api } from './api.js';

export function renderReportPage() {
  const reportsNavbutton = document.querySelector('.js-reports-navbutton');
  if (!reportsNavbutton) return;

  reportsNavbutton.addEventListener('click', async () => {
    document.querySelector('main').innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-muted, #666);">
        Loading attendance reports from database...
      </div>
    `;

    try {
      const [savedAttendance, studentsList, subjectsList] = await Promise.all([
        api.getAttendance(),
        api.getStudents(),
        api.getSubjects()
      ]);

      const studentSet = new Set();
      const subjectSet = new Set();

      // Collect from existing attendance records
      savedAttendance.forEach((record) => {
        if (record.subject) subjectSet.add(record.subject);
        if (record.records) {
          record.records.forEach((r) => {
            if (r.studentName) studentSet.add(r.studentName);
          });
        }
      });

      // Also ensure all registered students and subjects are available in dropdowns
      studentsList.forEach((s) => {
        if (s.name) studentSet.add(s.name);
      });
      subjectsList.forEach((sub) => {
        if (sub.name) subjectSet.add(sub.name);
      });

      let studentOptions = '<option value="" selected>Select Student...</option>';
      Array.from(studentSet).sort().forEach((student) => {
        studentOptions += `<option value="${student}">${student}</option>`;
      });

      let subjectOptions = '<option value="" selected>All Subjects</option>';
      Array.from(subjectSet).sort().forEach((subject) => {
        subjectOptions += `<option value="${subject}">${subject}</option>`;
      });

      const reportsPageHTML = `
        <div class="report-student-teacher-class-buttons-div">
          <button class="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path><path d="M22 10v6"></path><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path></svg>
            Students
          </button>
                 
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
            Staff
          </button>  
          
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-grid" style="color: var(--primary);"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
            Class
          </button>
        </div>

        <div class="report-filter-container">
          <p>Student</p> 
          <select name="students" class="students-dropdown js-student-select">
            ${studentOptions}
          </select>   

          <p>Subject</p>
          <select name="subject" class="subject-dropdown js-subject-select">
            ${subjectOptions}
          </select>
        </div>    
        
        <!-- Student Details Container -->
        <div class="report-student-detail-container">
          <div class="name-percent-div">
            <div class="studentname-date-subject-div">
              <p class="report-student-name js-display-name">Select a Student</p>
              <p class="class-subject-date js-display-details">-</p>
            </div>

            <div class="percent-number js-display-percent">
              0%
            </div>
          </div>
          
          <div class="graph-total-attended-missed-div">
            <div class="graph-div"></div>

            <div class="total-attended-missed-container">
              <div class="total-attended-missed-div">
                <p class="total-number js-total-count">0</p>
                <p class="total-title">TOTAL</p>
              </div>
              <div class="total-attended-missed-div">
                <p class="attended-number js-attended-count">0</p>
                <p class="attended-title">ATTENDED</p>
              </div>
              <div class="total-attended-missed-div">
                <p class="missed-number js-missed-count">0</p>
                <p class="missed-title">MISSED</p>
              </div>
            </div>

            <p class="report-container-ramaining-text js-status-text">Select a student to view attendance statistics</p>
          </div>
        </div>

        <div class="print-savepdf-div">
          <button class="js-print-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg>
            <p>Print</p>
          </button>
        </div>   
      `;

      document.querySelector('main').innerHTML = reportsPageHTML;

      const printBtn = document.querySelector('.js-print-btn');
      if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
      }

      const studentSelect = document.querySelector('.js-student-select');
      const subjectSelect = document.querySelector('.js-subject-select');

      function updateReportUI() {
        const selectedStudent = studentSelect.value;
        const selectedSubject = subjectSelect.value;

        const displayName = document.querySelector('.js-display-name');
        const displayDetails = document.querySelector('.js-display-details');
        const displayPercent = document.querySelector('.js-display-percent');
        const totalCountEl = document.querySelector('.js-total-count');
        const attendedCountEl = document.querySelector('.js-attended-count');
        const missedCountEl = document.querySelector('.js-missed-count');
        const statusText = document.querySelector('.js-status-text');

        if (!selectedStudent) {
          displayName.textContent = 'Select a Student';
          displayDetails.textContent = '-';
          displayPercent.textContent = '0%';
          totalCountEl.textContent = '0';
          attendedCountEl.textContent = '0';
          missedCountEl.textContent = '0';
          statusText.textContent = 'Select a student to view attendance statistics';
          return;
        }

        let totalClasses = 0;
        let attendedClasses = 0;
        let missedClasses = 0;
        let studentClass = '';

        const foundStd = studentsList.find((s) => s.name === selectedStudent);
        if (foundStd) {
          studentClass = foundStd.class || '';
        }

        savedAttendance.forEach((record) => {
          if (selectedSubject && record.subject !== selectedSubject) return;

          const studentRecord = record.records?.find((r) => r.studentName === selectedStudent);
          if (studentRecord) {
            totalClasses++;
            if (!studentClass && record.class) {
              studentClass = record.class;
            }

            if (studentRecord.status === 'present') {
              attendedClasses++;
            } else {
              missedClasses++;
            }
          }
        });

        const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

        displayName.textContent = selectedStudent;
        displayDetails.textContent = `${studentClass ? studentClass.toUpperCase() + ' ● ' : ''}${selectedSubject ? selectedSubject : 'ALL SUBJECTS'}`;
        displayPercent.textContent = `${percentage}%`;
        totalCountEl.textContent = totalClasses;
        attendedCountEl.textContent = attendedClasses;
        missedCountEl.textContent = missedClasses;

        if (totalClasses === 0) {
          statusText.textContent = 'No attendance recorded yet for this student';
        } else {
          statusText.textContent = `${selectedSubject ? selectedSubject.toUpperCase() : 'OVERALL'} ATTENDANCE SUMMARY`;
        }
      }

      studentSelect.addEventListener('change', updateReportUI);
      subjectSelect.addEventListener('change', updateReportUI);
    } catch (err) {
      document.querySelector('main').innerHTML = `
        <div style="padding: 40px; text-align: center; color: red;">
          Error loading reports: ${err.message}
        </div>
      `;
    }
  });
}