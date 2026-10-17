import { api } from './api.js';

let students = [];

export async function loadStudents() {
  try {
    students = await api.getStudents();
  } catch (error) {
    console.error('Failed to load students:', error);
  }
  return students;
}

export function renderAddstudentPage() {
  const studentsNavButton = document.querySelector('.js-students-navbutton');
  if (studentsNavButton) {
    studentsNavButton.addEventListener('click', async () => {
      document.querySelector('main').innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted, #666);">
          Loading students...
        </div>
      `;
      await loadStudents();
      renderStudentList();
    });
  }
}

export function renderStudentList(searchQuery = '') {
  const query = searchQuery.toLowerCase().trim();

  const filteredStudents = students.filter((student) => {
    return (
      (student.name || '').toLowerCase().includes(query) ||
      (student.class || '').toLowerCase().includes(query) ||
      String(student.rollNo || '').includes(query)
    );
  });

  let studentItemsHTML = '';
  if (filteredStudents.length === 0) {
    studentItemsHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted, #777);">
        ${students.length === 0 ? 'No students found. Click "Add Student" to add one.' : 'No matching students found.'}
      </div>
    `;
  } else {
    filteredStudents.forEach((student) => {
      const studentId = student._id || student.id;
      studentItemsHTML += `
        <div class="students-list-div">
          <div>
            <p class="student-name">${student.name}</p>
            <p>${student.class || 'No Class'} ${student.rollNo ? `(Roll: ${student.rollNo})` : ''}</p>
          </div>
          <div class="edit-delete-buttons">
            <svg data-id="${studentId}" class="edit-button js-edit-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil" aria-hidden="true" style="color: var(--secondary);"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
            <svg data-id="${studentId}" class="delete-button js-delete-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 lucide-trash-2" aria-hidden="true" style="color: var(--red);"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </div>
        </div>
      `;
    });
  }

  const pageHTML = `
    <div class="students-title-icon-addbutton-div">
      <div class="icon-student-title-div">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus" aria-hidden="true" style="color: var(--primary);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
        <div class="students-title-div">
          <p class="student-title">Students</p>
          <p class="total-text">${filteredStudents.length} total</p>
        </div>
      </div>
      <button class="js-add-student-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        Add Student
      </button>
    </div>
    <div class="search-bar-icon-div">
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 muted" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
      <input type="text" class="js-search-input" value="${searchQuery}" placeholder="Search students...">
    </div>
    <div class="students-list-container">
      ${studentItemsHTML}
    </div>
  `;

  document.querySelector('main').innerHTML = pageHTML;

  // Search Input Event Listener & Focus Handling
  const searchInput = document.querySelector('.js-search-input');
  if (searchInput) {
    searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
    searchInput.addEventListener('input', (e) => {
      renderStudentList(e.target.value);
    });
  }

  // Add Student Button Listener
  const addStudentBtn = document.querySelector('.js-add-student-button');
  if (addStudentBtn) {
    addStudentBtn.addEventListener('click', () => openStudentForm());
  }

  // Edit Button Listener
  document.querySelectorAll('.js-edit-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const studentId = btn.dataset.id;
      const studentToEdit = students.find((s) => (s._id || s.id) == studentId);
      if (studentToEdit) {
        openStudentForm(studentToEdit);
      }
    });
  });

  // Delete Button Listener
  document.querySelectorAll('.js-delete-button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const studentId = btn.dataset.id;
      const confirmDelete = confirm('Are you sure you want to delete this student?');
      if (!confirmDelete) return;

      try {
        await api.deleteStudent(studentId);
        await loadStudents();
        renderStudentList(searchQuery);
      } catch (err) {
        alert(`Error deleting student: ${err.message}`);
      }
    });
  });
}

async function openStudentForm(studentToEdit = null) {
  const isEdit = Boolean(studentToEdit);
  const studentId = studentToEdit ? (studentToEdit._id || studentToEdit.id) : null;
  let uploadedPhotoBase64 = studentToEdit?.photo || '';

  // Dynamically fetch classes from MongoDB
  let classOptionsHTML = '';
  try {
    const classes = await api.getClasses();
    if (classes.length > 0) {
      classOptionsHTML = classes.map((c) => {
        const isSelected = studentToEdit && (
          studentToEdit.class?.toLowerCase() === c.name.toLowerCase()
        );
        return `<option value="${c.name}" ${isSelected ? 'selected' : ''}>${c.name}</option>`;
      }).join('');
    } else {
      classOptionsHTML = `
        <option value="Plus One">Plus One</option>
        <option value="Plus Two">Plus Two</option>
        <option value="Bs1">Bs1</option>
        <option value="Bs2">Bs2</option>
      `;
    }
  } catch (e) {
    classOptionsHTML = `
      <option value="Plus One">Plus One</option>
      <option value="Plus Two">Plus Two</option>
      <option value="Bs1">Bs1</option>
      <option value="Bs2">Bs2</option>
    `;
  }

  const addStudentWindowHTML = `
    <div class="overlay-div">
      <div class="add-student-window">
        <div class="addstudent-title-x-div">
          <p class="add-student-title">${isEdit ? 'Edit Student' : 'Add Student'}</p>
          <button type="button" class="js-students-form-closebutton">X</button>
        </div>
        
        <form class="js-student-form">
          <div class="image-div">
            <input type="file" id="photo-upload" accept="image/*" hidden>
            <label for="photo-upload" class="upload-box" style="${uploadedPhotoBase64 ? `background-image: url('${uploadedPhotoBase64}'); background-size: cover; background-position: center;` : ''}">
              ${uploadedPhotoBase64 ? '' : `
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#007a5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                  <line x1="19" y1="9" x2="19" y2="15"></line>
                  <line x1="16" y1="12" x2="22" y2="12"></line>
                </svg>
                <span class="upload-text">PHOTO</span>
              `}
            </label>
          </div>

          <p class="name-class-text">Name</p>
          <input name="name" class="name-input" type="text" placeholder="Full Name" value="${studentToEdit?.name || ''}" required>
          
          <p class="name-class-text">Class</p>
          <select name="class" class="class-dropdown-2" required>
            <option value="" disabled ${!studentToEdit ? 'selected' : ''}>Select Class</option>
            ${classOptionsHTML}
          </select>
          
          <p class="rollno-text">Roll No.</p>
          <input name="rollNo" class="rollno-input" type="number" placeholder="e.g : 12" value="${studentToEdit?.rollNo ?? ''}">

          <p class="address-text">Address</p>
          <input name="address" class="address-input" type="text" placeholder="House No., Street name, Area" value="${studentToEdit?.address || ''}">

          <p class="place-text">Place</p>
          <input name="place" class="place-input" type="text" placeholder="e.g : Kochi" value="${studentToEdit?.place || ''}">

          <p class="district-text">District</p>
          <input name="district" class="district-input" type="text" placeholder="e.g : Ernakulam" value="${studentToEdit?.district || ''}">

          <p class="state-text">State</p>
          <input name="state" class="state-input" type="text" placeholder="eg : Kerala" value="${studentToEdit?.state || ''}">

          <p class="family-text">Family Details</p>

          <p class="father-name">Father's Name</p>
          <input name="fatherName" class="father-input" type="text" placeholder="e.g., Abdullah Al-Mansoor" value="${studentToEdit?.fatherName || ''}">

          <p class="mother-name">Mother's Name</p>
          <input name="motherName" class="mother-input" type="text" placeholder="e.g., Amina Al-Zahra" value="${studentToEdit?.motherName || ''}">
          
          <p class="contact-no">Father's Mobile</p>
          <input name="fatherMobile" class="contact-no-input" type="tel" placeholder="enter WhatsApp no." value="${studentToEdit?.fatherMobile || ''}">
          
          <p class="academic-text">Academic Status</p>

          <p class="admission-date-text">Admission Date</p>
          <input name="admissonDate" class="father-input" type="text" placeholder="DD / MM / YYYY" value="${studentToEdit?.admissonDate || ''}">

          <p class="rank-text">Rank</p>
          <input name="rank" class="rank-input" type="text" placeholder="eg : Rank 1" value="${studentToEdit?.rank || ''}">

          <p class="previous-college-text">Previous College</p>
          <input name="previousCollege" class="previous-college-input" type="text" placeholder="e.g : Al-Azhar Secondary School" value="${studentToEdit?.previousCollege || ''}">

          <button type="submit" class="addstudent-submit-button js-submit-student-button">
            ${isEdit ? 'Update Student' : 'Add Student'}
          </button>
        </form>
      </div>
    </div>
  `;

  document.querySelector('main').insertAdjacentHTML('beforeend', addStudentWindowHTML);

  const photoInput = document.getElementById('photo-upload');
  const uploadBox = document.querySelector('.upload-box');
  
  if (photoInput && uploadBox) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedPhotoBase64 = event.target.result;
          uploadBox.style.backgroundImage = `url('${uploadedPhotoBase64}')`;
          uploadBox.style.backgroundSize = 'cover';
          uploadBox.style.backgroundPosition = 'center';
          uploadBox.innerHTML = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const studentForm = document.querySelector('.js-student-form');
  const submitBtn = document.querySelector('.js-submit-student-button');

  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(studentForm);
    const formValues = Object.fromEntries(formData.entries());

    const studentPayload = {
      ...formValues,
      rollNo: formValues.rollNo ? Number(formValues.rollNo) : null,
      photo: uploadedPhotoBase64
    };

    if (submitBtn) submitBtn.disabled = true;

    try {
      if (isEdit) {
        await api.updateStudent(studentId, studentPayload);
      } else {
        await api.createStudent(studentPayload);
      }

      await loadStudents();
      const overlay = document.querySelector('.overlay-div');
      if (overlay) overlay.remove();
      renderStudentList();
    } catch (err) {
      alert(`Error saving student: ${err.message}`);
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  const closeButton = document.querySelector('.js-students-form-closebutton');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      const overlay = document.querySelector('.overlay-div');
      if (overlay) overlay.remove();
    });
  }
}