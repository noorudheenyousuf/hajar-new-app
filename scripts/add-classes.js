import { api } from './api.js';

let classes = [];

export async function loadClasses() {
  try {
    classes = await api.getClasses();
  } catch (error) {
    console.error('Failed to load classes from API:', error);
  }
  return classes;
}

export function getLoadedClasses() {
  return classes;
}

export function renderAddClassPage() {
  const classesNavbutton = document.querySelector('.js-classes-navbutton');
  if (classesNavbutton) {
    classesNavbutton.addEventListener('click', async () => {
      document.querySelector('main').innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted, #666);">
          Loading classes...
        </div>
      `;
      await loadClasses();
      renderClassList();
    });
  }
}

export function renderClassList(searchQuery = '') {
  const query = searchQuery.toLowerCase().trim();
  const filteredClasses = classes.filter((cls) => {
    return (cls.name || '').toLowerCase().includes(query);
  });

  let classListHTML = '';
  if (filteredClasses.length === 0) {
    classListHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted, #777);">
        ${classes.length === 0 ? 'No classes found. Click "Add Class" to create one.' : 'No matching classes found.'}
      </div>
    `;
  } else {
    filteredClasses.forEach((cls) => {
      const classId = cls._id || cls.id;
      classListHTML += `
        <div class="students-list-div">
          <div>
            <p class="student-name">${cls.name}</p>
          </div>
          <div class="edit-delete-buttons">
            <svg data-id="${classId}" class="edit-button js-edit-class-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
            <svg data-id="${classId}" class="delete-button js-delete-class-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </div>
        </div>
      `;
    });
  }

  const classesPageHTML = `
    <div class="students-title-icon-addbutton-div">
      <div class="icon-student-title-div">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>                
        <div class="students-title-div">
          <p class="student-title">Classes</p>
          <p class="total-text">${filteredClasses.length} total</p>
        </div>
      </div>
      
      <button class="js-open-class-modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        Add Class
      </button>
    </div>

    <div class="search-bar-icon-div">
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
      <input type="text" class="js-search-input" value="${searchQuery}" placeholder="Search classes...">
    </div>

    <div class="classes-list-container">
      ${classListHTML}
    </div>
  `;

  document.querySelector('main').innerHTML = classesPageHTML;

  // Search Input Event Listener & Cursor Placement
  const searchInput = document.querySelector('.js-search-input');
  if (searchInput) {
    searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
    searchInput.addEventListener('input', (e) => {
      renderClassList(e.target.value);
    });
  }

  // Open Modal
  const openModalBtn = document.querySelector('.js-open-class-modal');
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      openClassForm();
    });
  }

  // Edit Button Event Listener
  document.querySelectorAll('.js-edit-class-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const classId = btn.dataset.id;
      const classToEdit = classes.find((c) => (c._id || c.id) == classId);
      if (classToEdit) {
        openClassForm(classToEdit);
      }
    });
  });

  // Delete Button Event Listener
  document.querySelectorAll('.js-delete-class-button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const classId = btn.dataset.id;
      const confirmDelete = confirm('Are you sure you want to delete this class?');
      if (!confirmDelete) return;

      try {
        await api.deleteClass(classId);
        await loadClasses();
        renderClassList(searchQuery);
      } catch (err) {
        alert(`Error deleting class: ${err.message}`);
      }
    });
  });
}

function openClassForm(editClass = null) {
  const isEdit = Boolean(editClass);
  const classId = editClass ? (editClass._id || editClass.id) : null;

  const addClassWindowHTML = `
    <div class="overlay-div">
      <div class="add-student-window">
        <div class="addstudent-title-x-div">
          <p class="add-student-title">${isEdit ? 'Edit Class' : 'Add Class'}</p>
          <button type="button" class="js-class-form-closebutton">X</button>
        </div>
      
        <form class="js-class-form">
          <p class="name-class-text">Class Name</p>
          <input class="name-input js-class-name-input" type="text" value="${isEdit ? editClass.name : ''}" placeholder="e.g. Plus One / BS1" required>
          
          <button type="submit" class="addstudent-submit-button js-class-submit-btn">${isEdit ? 'Update Class' : 'Save Class'}</button>
        </form>
      </div>
    </div>
  `;

  document.querySelector('main').insertAdjacentHTML('beforeend', addClassWindowHTML);

  const overlay = document.querySelector('.overlay-div');

  document.querySelector('.js-class-form-closebutton').addEventListener('click', () => {
    if (overlay) overlay.remove();
  });

  document.querySelector('.js-class-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputVal = document.querySelector('.js-class-name-input').value.trim();
    const submitBtn = document.querySelector('.js-class-submit-btn');

    if (inputVal) {
      if (submitBtn) submitBtn.disabled = true;
      try {
        if (isEdit) {
          await api.updateClass(classId, inputVal);
        } else {
          await api.createClass(inputVal);
        }
        await loadClasses();
        if (overlay) overlay.remove();
        renderClassList();
      } catch (err) {
        alert(`Error saving class: ${err.message}`);
        if (submitBtn) submitBtn.disabled = false;
      }
    }
  });
}