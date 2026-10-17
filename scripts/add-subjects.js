import { api } from './api.js';

let subjects = [];

export async function loadSubjects() {
  try {
    subjects = await api.getSubjects();
  } catch (error) {
    console.error('Failed to load subjects:', error);
  }
  return subjects;
}

export function renderAddSubjectPage() {
  const subjectsNavbutton = document.querySelector('.js-subjects-navbutton');
  if (subjectsNavbutton) {
    subjectsNavbutton.addEventListener('click', async () => {
      document.querySelector('main').innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted, #666);">
          Loading subjects...
        </div>
      `;
      await loadSubjects();
      renderSubjectList();
    });
  }
}

export function renderSubjectList(searchQuery = '') {
  const query = searchQuery.toLowerCase().trim();

  const filteredSubjects = subjects.filter((subject) => {
    return (
      (subject.name || '').toLowerCase().includes(query) ||
      (subject.class || '').toLowerCase().includes(query)
    );
  });

  let subjectListHTML = '';
  if (filteredSubjects.length === 0) {
    subjectListHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted, #777);">
        ${subjects.length === 0 ? 'No subjects found. Click "Add Subject" to create one.' : 'No matching subjects found.'}
      </div>
    `;
  } else {
    filteredSubjects.forEach((subject) => {
      const subjectId = subject._id || subject.id;
      subjectListHTML += `
        <div class="students-list-div">
          <div>
            <p class="student-name">${subject.name}</p>
            <p>${subject.class}</p>
          </div>
          <div class="edit-delete-buttons">
            <svg data-id="${subjectId}" class="edit-button js-edit-subject-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
            <svg data-id="${subjectId}" class="delete-button js-delete-subject-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </div>
        </div>
      `;
    });
  }

  const subjectsPageHTML = `
    <div class="students-title-icon-addbutton-div">
      <div class="icon-student-title-div">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open" aria-hidden="true" style="color: var(--text-muted);"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
        <div class="students-title-div">
          <p class="student-title">Subjects</p>
          <p class="total-text">${filteredSubjects.length} total</p>
        </div>
      </div>
      
      <button class="js-open-subject-modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        Add Subject
      </button>
    </div>

    <div class="search-bar-icon-div">
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 muted" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
      <input type="text" class="js-search-input" value="${searchQuery}" placeholder="Search subjects...">
    </div>

    <div class="subjects-list-container">
      ${subjectListHTML}
    </div>
  `;
  
  document.querySelector('main').innerHTML = subjectsPageHTML;

  // Search Input Event Listener
  const searchInput = document.querySelector('.js-search-input');
  if (searchInput) {
    searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
    searchInput.addEventListener('input', (e) => {
      renderSubjectList(e.target.value);
    });
  }

  // Modal Trigger
  const openModalBtn = document.querySelector('.js-open-subject-modal');
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      openSubjectForm();
    });
  }

  // Edit Event Listener
  document.querySelectorAll('.js-edit-subject-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const subjectId = btn.dataset.id;
      const subjectToEdit = subjects.find((s) => (s._id || s.id) == subjectId);
      if (subjectToEdit) {
        openSubjectForm(subjectToEdit);
      }
    });
  });

  // Delete Event Listener
  document.querySelectorAll('.js-delete-subject-button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const subjectId = btn.dataset.id;
      const confirmDelete = confirm('Are you sure you want to delete this subject?');
      if (!confirmDelete) return;

      try {
        await api.deleteSubject(subjectId);
        await loadSubjects();
        renderSubjectList(searchQuery);
      } catch (err) {
        alert(`Error deleting subject: ${err.message}`);
      }
    });
  });
}

async function openSubjectForm(editSubject = null) {
  const isEdit = Boolean(editSubject);
  const subjectId = editSubject ? (editSubject._id || editSubject.id) : null;

  // Fetch classes dynamically from MongoDB
  let classOptionsHTML = '';
  try {
    const classes = await api.getClasses();
    if (classes.length > 0) {
      classOptionsHTML = classes.map((c) => {
        const isSelected = editSubject && editSubject.class?.toLowerCase() === c.name.toLowerCase();
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

  const addSubjectWindowHTML = `
    <div class="overlay-div">
      <div class="add-student-window">
        <div class="addstudent-title-x-div">
          <p class="add-student-title">${isEdit ? 'Edit Subject' : 'Add Subject'}</p>
          <button type="button" class="js-subject-form-closebutton">X</button>
        </div>
      
        <form class="js-subject-form">
          <p class="name-class-text">Subject Name</p>
          <input class="name-input js-subject-name-input" type="text" value="${isEdit ? editSubject.name : ''}" placeholder="Subject name" required>
          
          <p class="name-class-text">Class</p>
          <select name="class" class="class-dropdown-2 js-subject-class-select" required>
            <option value="" ${!isEdit ? 'selected' : ''}>Select Class...</option>
            ${classOptionsHTML}
          </select>

          <button type="submit" class="addstudent-submit-button js-subject-submit-btn">${isEdit ? 'Update Subject' : 'Save Subject'}</button>
        </form>
      </div>
    </div>
  `;

  document.querySelector('main').insertAdjacentHTML('beforeend', addSubjectWindowHTML);

  const overlay = document.querySelector('.overlay-div');

  document.querySelector('.js-subject-form-closebutton').addEventListener('click', () => {
    if (overlay) overlay.remove();
  });

  document.querySelector('.js-subject-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameVal = document.querySelector('.js-subject-name-input').value.trim();
    const classVal = document.querySelector('.js-subject-class-select').value;
    const submitBtn = document.querySelector('.js-subject-submit-btn');

    if (nameVal && classVal) {
      if (submitBtn) submitBtn.disabled = true;
      try {
        if (isEdit) {
          await api.updateSubject(subjectId, {
            name: nameVal,
            class: classVal
          });
        } else {
          await api.createSubject({
            name: nameVal,
            class: classVal
          });
        }

        await loadSubjects();
        if (overlay) overlay.remove();
        renderSubjectList();
      } catch (err) {
        alert(`Error saving subject: ${err.message}`);
        if (submitBtn) submitBtn.disabled = false;
      }
    }
  });
}