import { api } from './api.js';

let teachers = [];

export async function loadTeachers() {
  try {
    teachers = await api.getTeachers();
  } catch (error) {
    console.error('Failed to load teachers:', error);
  }
  return teachers;
}

export function renderAddTeacherPage() {
  const teachersNavbutton = document.querySelector('.js-teachers-navbutton');
  if (teachersNavbutton) {
    teachersNavbutton.addEventListener('click', async () => {
      document.querySelector('main').innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted, #666);">
          Loading teachers...
        </div>
      `;
      await loadTeachers();
      renderTeacherList();
    });
  }
}

export function renderTeacherList(searchQuery = '') {
  const query = searchQuery.toLowerCase().trim();

  const filteredTeachers = teachers.filter((teacher) => {
    return (
      (teacher.name || '').toLowerCase().includes(query) ||
      (teacher.incharge || '').toLowerCase().includes(query)
    );
  });

  let teacherListHTML = '';
  if (filteredTeachers.length === 0) {
    teacherListHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted, #777);">
        ${teachers.length === 0 ? 'No teachers found. Click "Add Teacher" to add one.' : 'No matching teachers found.'}
      </div>
    `;
  } else {
    filteredTeachers.forEach((teacher) => {
      const teacherId = teacher._id || teacher.id;
      teacherListHTML += `
        <div class="students-list-div">
          <div>
            <p class="student-name">${teacher.name}</p>
            <p>incharge <mark>${teacher.incharge || 'None'}</mark></p>
          </div>
          <div class="edit-delete-buttons">
            <svg data-id="${teacherId}" class="edit-button js-edit-teacher-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
            <svg data-id="${teacherId}" class="delete-button js-delete-teacher-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </div>
        </div>
      `;
    });
  }

  const teachersPageHTML = `
    <div class="students-title-icon-addbutton-div">
      <div class="icon-student-title-div">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users" aria-hidden="true" style="color: var(--text-muted);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
        <div class="students-title-div">
          <p class="student-title">Teachers</p>
          <p class="total-text">${filteredTeachers.length} total</p>
        </div>
      </div>
      
      <button class="js-open-teacher-modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        Add Teacher
      </button>
    </div>

    <div class="search-bar-icon-div">
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 muted" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
      <input type="text" class="js-search-input" value="${searchQuery}" placeholder="Search teachers...">
    </div>

    <div class="teachers-list-container">
      ${teacherListHTML}
    </div>
  `;

  document.querySelector('main').innerHTML = teachersPageHTML;

  // Search Input Event Listener
  const searchInput = document.querySelector('.js-search-input');
  if (searchInput) {
    searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
    searchInput.addEventListener('input', (e) => {
      renderTeacherList(e.target.value);
    });
  }

  // Add Teacher Modal Event
  const openModalBtn = document.querySelector('.js-open-teacher-modal');
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      openTeacherForm();
    });
  }

  // Edit Button Event Listener
  document.querySelectorAll('.js-edit-teacher-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const teacherId = btn.dataset.id;
      const teacherToEdit = teachers.find((t) => (t._id || t.id) == teacherId);
      if (teacherToEdit) {
        openTeacherForm(teacherToEdit);
      }
    });
  });

  // Delete Button Event Listener
  document.querySelectorAll('.js-delete-teacher-button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const teacherId = btn.dataset.id;
      const confirmDelete = confirm('Are you sure you want to delete this teacher?');
      if (!confirmDelete) return;

      try {
        await api.deleteTeacher(teacherId);
        await loadTeachers();
        renderTeacherList(searchQuery);
      } catch (err) {
        alert(`Error deleting teacher: ${err.message}`);
      }
    });
  });
}

async function openTeacherForm(editTeacher = null) {
  const isEdit = Boolean(editTeacher);
  const teacherId = editTeacher ? (editTeacher._id || editTeacher.id) : null;

  // Fetch classes dynamically from MongoDB
  let classOptionsHTML = '';
  try {
    const classes = await api.getClasses();
    if (classes.length > 0) {
      classOptionsHTML = classes.map((c) => {
        const isSelected = editTeacher && editTeacher.incharge?.toLowerCase() === c.name.toLowerCase();
        return `<option value="${c.name}" ${isSelected ? 'selected' : ''}>${c.name}</option>`;
      }).join('');
    } else {
      classOptionsHTML = `
        <option value="Plus One">Plus One</option>
        <option value="Plus Two">Plus Two</option>
        <option value="BS1">BS1</option>
        <option value="BS2">BS2</option>
      `;
    }
  } catch (e) {
    classOptionsHTML = `
      <option value="Plus One">Plus One</option>
      <option value="Plus Two">Plus Two</option>
      <option value="BS1">BS1</option>
      <option value="BS2">BS2</option>
    `;
  }

  const addTeacherWindowHTML = `
    <div class="overlay-div">
      <div class="add-student-window">
        <div class="addstudent-title-x-div">
          <p class="add-student-title">${isEdit ? 'Edit Teacher' : 'Add Teacher'}</p>
          <button type="button" class="js-teacher-form-closebutton">X</button>
        </div>
      
        <form class="js-teacher-form">
          <p class="name-class-text">Name</p>
          <input class="name-input js-teacher-name-input" type="text" value="${isEdit ? editTeacher.name : ''}" placeholder="Teacher name" required>
          
          <p class="name-class-text">Incharge Class</p>
          <select name="class" class="class-dropdown-2 js-teacher-class-select" required>
            <option value="" ${!isEdit ? 'selected' : ''}>Select Class...</option>
            ${classOptionsHTML}
          </select>
          
          <button type="submit" class="addstudent-submit-button js-teacher-submit-btn">${isEdit ? 'Update Teacher' : 'Save Teacher'}</button>
        </form>
      </div>
    </div>
  `;

  document.querySelector('main').insertAdjacentHTML('beforeend', addTeacherWindowHTML);

  const overlay = document.querySelector('.overlay-div');

  document.querySelector('.js-teacher-form-closebutton').addEventListener('click', () => {
    if (overlay) overlay.remove();
  });

  document.querySelector('.js-teacher-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameVal = document.querySelector('.js-teacher-name-input').value.trim();
    const classVal = document.querySelector('.js-teacher-class-select').value;
    const submitBtn = document.querySelector('.js-teacher-submit-btn');

    if (nameVal && classVal) {
      if (submitBtn) submitBtn.disabled = true;
      try {
        if (isEdit) {
          await api.updateTeacher(teacherId, {
            name: nameVal,
            incharge: classVal
          });
        } else {
          await api.createTeacher({
            name: nameVal,
            incharge: classVal
          });
        }

        await loadTeachers();
        if (overlay) overlay.remove();
        renderTeacherList();
      } catch (err) {
        alert(`Error saving teacher: ${err.message}`);
        if (submitBtn) submitBtn.disabled = false;
      }
    }
  });
}