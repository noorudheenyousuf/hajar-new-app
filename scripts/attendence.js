import { api } from './api.js';

let cachedClasses = [];
let cachedSubjects = [];
let cachedStudents = [];

export function renderAttendencePage() {
  const attendenceNavbutton = document.querySelector('.js-attendence-navbutton');
  if (attendenceNavbutton) {
    attendenceNavbutton.addEventListener('click', () => {
      displayAttendanceView();
    });
  }
}

export async function displayAttendanceView() {
  const mainEl = document.querySelector('main');
  if (!mainEl) return;

  mainEl.innerHTML = `
    <div style="padding: 40px; text-align: center; color: var(--text-muted, #666);">
      Loading attendance data...
    </div>
  `;

  try {
    const [classes, subjects, students] = await Promise.all([
      api.getClasses(),
      api.getSubjects(),
      api.getStudents()
    ]);

    cachedClasses = classes;
    cachedSubjects = subjects;
    cachedStudents = students;

    let classOptionsHTML = '';
    if (classes.length === 0) {
      classOptionsHTML = '<option value="" disabled>No classes found</option>';
    } else {
      classes.forEach((cls) => {
        classOptionsHTML += `<option value="${cls.name}">${cls.name}</option>`;
      });
    }

    let subjectOptionsHTML = '';
    if (subjects.length === 0) {
      subjectOptionsHTML = '<option value="" disabled>No subjects found</option>';
    } else {
      subjects.forEach((sub) => {
        subjectOptionsHTML += `<option value="${sub.name}" data-class="${sub.class}">${sub.name} (${sub.class})</option>`;
      });
    }

    const attendencePageHTML = `
      <div class="attendence-filter-container js-attendence-filter-container">
        <div class="student-staff-buttons-div">
          <button class="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path><path d="M22 10v6"></path><path d="M6 12.5V16a6 6 0 0 0 12 0v-3.5"></path></svg>
            Students
          </button>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
            Staff
          </button>     
        </div>

        <div class="date-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
          <p>Date</p>
        </div>
        <input class="date-input js-date-input" type="date">

        <div class="class-subject-filter-div">
          <div class="class-subject-filter">
            <p>Class</p>
            <select name="class" class="class-dropdown js-class-dropdown">
              <option value="" selected disabled>Select Class</option>
              ${classOptionsHTML}
            </select>
          </div>
          <div class="class-subject-filter">
            <p>Subject</p>
            <select name="subject" class="subject-dropdown js-subject-dropdown">
              <option value="" selected disabled>Select Subject</option>
              ${subjectOptionsHTML}
            </select>
          </div>
        </div>    
      </div>
      <div class="js-attendence-student-list">
        <div class="attendence-students-list js-student-list">
          <div class="attendence-students-list-demo">
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check muted mx-auto mb-2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
            <p class="choose-text">Choose a class & subject</p>
            <p class="pick-text">Pick a class and subject above to load students</p>
          </div>
        </div>
      </div>
    `;

    mainEl.innerHTML = attendencePageHTML;
    setTodayDate();

    const classSelect = document.querySelector('.js-class-dropdown');
    const subjectSelect = document.querySelector('.js-subject-dropdown');
    const dateInput = document.querySelector('.js-date-input');
    const studentListContainer = document.querySelector('.js-attendence-student-list');

    let studentStatusMap = {};
    let currentFilteredStudents = [];

    // Filter subjects when class changes
    classSelect.addEventListener('change', () => {
      const selectedClass = classSelect.value;
      const filteredSubs = cachedSubjects.filter(
        (s) => !s.class || s.class.toLowerCase() === selectedClass.toLowerCase()
      );
      
      let newSubOpts = '<option value="" selected disabled>Select Subject</option>';
      if (filteredSubs.length > 0) {
        filteredSubs.forEach((sub) => {
          newSubOpts += `<option value="${sub.name}">${sub.name}</option>`;
        });
      } else {
        // If no subjects match this specific class, show all subjects
        cachedSubjects.forEach((sub) => {
          newSubOpts += `<option value="${sub.name}">${sub.name}</option>`;
        });
      }
      subjectSelect.innerHTML = newSubOpts;
      loadStudentsForAttendance();
    });

    subjectSelect.addEventListener('change', loadStudentsForAttendance);
    dateInput.addEventListener('change', loadStudentsForAttendance);

    async function loadStudentsForAttendance() {
      const selectedClass = classSelect.value;
      const selectedSubject = subjectSelect.value;
      const selectedDate = dateInput.value;

      if (!selectedClass || !selectedSubject) {
        return;
      }

      currentFilteredStudents = cachedStudents.filter((std) => {
        return (std.class || '').toLowerCase() === selectedClass.toLowerCase();
      });

      if (currentFilteredStudents.length === 0) {
        studentListContainer.innerHTML = `
          <div style="padding: 30px; text-align: center; color: var(--text-muted, #777);">
            <p>No students found in class <strong>${selectedClass}</strong>.</p>
            <p style="font-size: 13px; margin-top: 5px;">Add students to this class in the Students tab.</p>
          </div>
        `;
        return;
      }

      // Check if attendance already recorded in MongoDB for this date, class, subject
      studentStatusMap = {};
      try {
        const existingRecords = await api.getAttendance({
          date: selectedDate,
          class: selectedClass,
          subject: selectedSubject
        });

        if (existingRecords && existingRecords.length > 0 && existingRecords[0].records) {
          const recMap = {};
          existingRecords[0].records.forEach((r) => {
            const key = String(r.studentId || r.studentName);
            recMap[key] = r.status;
          });

          currentFilteredStudents.forEach((student, index) => {
            const stdId = String(student._id || student.id || student.name);
            const savedStatus = recMap[stdId] || recMap[student.name];
            studentStatusMap[index] = savedStatus || 'present';
          });
        } else {
          // Default all to present
          currentFilteredStudents.forEach((_, index) => {
            studentStatusMap[index] = 'present';
          });
        }
      } catch (err) {
        console.error('Error fetching existing attendance:', err);
        currentFilteredStudents.forEach((_, index) => {
          studentStatusMap[index] = 'present';
        });
      }

      renderList();
    }

    function renderList() {
      let presentCount = 0;
      let absentCount = 0;
      let studentsCardsHTML = '';

      currentFilteredStudents.forEach((student, index) => {
        const studentName = student.name || 'Unknown';
        const isPresent = studentStatusMap[index] === 'present';
        if (isPresent) presentCount++;
        else absentCount++;

        const studentPhoto = student.photo || 'images/nooru.jpeg';

        studentsCardsHTML += `
          <div class="${isPresent ? 'students-list-attendence-div' : 'students-list-attendence-absent-div'} js-toggle-status" data-index="${index}">
            <img class="attendence-profile-picture" src="${studentPhoto}" alt="${studentName}">
            <p class="attendence-student-name">${studentName}</p>
            <div class="${isPresent ? 'present-status-div' : 'absent-status-div'}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide ${isPresent ? 'lucide-circle-check' : 'lucide-circle-x'}">
                <circle cx="12" cy="12" r="10"></circle>
                ${isPresent ? '<path d="m9 12 2 2 4-4"></path>' : '<path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>'}
              </svg>
              <p>${isPresent ? 'present' : 'absent'}</p>
            </div>
          </div>
        `;
      });

      studentListContainer.innerHTML = `
        <div class="present-absent-allabsent-div">
          <div class="present-div">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            ${presentCount} Present
          </div>
          <div class="absent-div">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m15 9-6 6"></path>
              <path d="m9 9 9 6"></path>
            </svg>
            ${absentCount} Absent
          </div>
          <button class="all-absent-btn js-all-absent-btn">All Absent</button>
        </div>
        
        <div class="attendence-students-list-grid">
          ${studentsCardsHTML}
        </div>
        <div class="save-button-div">
          <button class="save-attendence-button js-save-attendance-btn">Save Attendence</button>
        </div>
      `;

      // Card click toggle
      studentListContainer.querySelectorAll('.js-toggle-status').forEach((card) => {
        card.addEventListener('click', () => {
          const idx = card.dataset.index;
          studentStatusMap[idx] = studentStatusMap[idx] === 'present' ? 'absent' : 'present';
          renderList();
        });
      });

      // All absent button
      const allAbsentBtn = studentListContainer.querySelector('.js-all-absent-btn');
      if (allAbsentBtn) {
        allAbsentBtn.addEventListener('click', () => {
          currentFilteredStudents.forEach((_, idx) => {
            studentStatusMap[idx] = 'absent';
          });
          renderList();
        });
      }

      // Save button
      const saveBtn = studentListContainer.querySelector('.js-save-attendance-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          const selectedDate = dateInput.value;
          const selectedClass = classSelect.value;
          const selectedSubject = subjectSelect.value;

          if (!selectedDate) {
            alert('Please select a date!');
            return;
          }

          saveBtn.disabled = true;
          saveBtn.textContent = 'Saving...';

          const attendanceRecords = currentFilteredStudents.map((student, index) => {
            return {
              studentId: student._id || student.id || index,
              studentName: student.name,
              status: studentStatusMap[index] || 'present'
            };
          });

          try {
            await api.saveAttendance({
              date: selectedDate,
              class: selectedClass,
              subject: selectedSubject,
              records: attendanceRecords
            });

            alert('Attendance saved successfully to MongoDB!');
          } catch (err) {
            alert(`Error saving attendance: ${err.message}`);
          } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Attendence';
          }
        });
      }
    }
  } catch (error) {
    mainEl.innerHTML = `
      <div style="padding: 40px; text-align: center; color: red;">
        Error connecting to server: ${error.message}
      </div>
    `;
  }
}

function setTodayDate() {
  const dateInput = document.querySelector('.js-date-input');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }
}