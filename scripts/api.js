// API Client for Hajar App Full Stack (Node.js + Express + MongoDB)

const BASE_URL = ''; // Same origin

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!res.ok) {
      let errMsg = `Request failed: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.message) errMsg = errorData.message;
      } catch (e) {
        // use default error message
      }
      throw new Error(errMsg);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Classes
  async getClasses() {
    return await request('/api/classes');
  },
  async createClass(name) {
    return await request('/api/classes', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },
  async updateClass(id, name) {
    return await request(`/api/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
  },
  async deleteClass(id) {
    return await request(`/api/classes/${id}`, {
      method: 'DELETE'
    });
  },

  // Students
  async getStudents(className = '') {
    const query = className ? `?class=${encodeURIComponent(className)}` : '';
    return await request(`/api/students${query}`);
  },
  async createStudent(studentData) {
    return await request('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },
  async updateStudent(id, studentData) {
    return await request(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  },
  async deleteStudent(id) {
    return await request(`/api/students/${id}`, {
      method: 'DELETE'
    });
  },

  // Teachers
  async getTeachers() {
    return await request('/api/teachers');
  },
  async createTeacher(teacherData) {
    return await request('/api/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    });
  },
  async updateTeacher(id, teacherData) {
    return await request(`/api/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData)
    });
  },
  async deleteTeacher(id) {
    return await request(`/api/teachers/${id}`, {
      method: 'DELETE'
    });
  },

  // Subjects
  async getSubjects(className = '') {
    const query = className ? `?class=${encodeURIComponent(className)}` : '';
    return await request(`/api/subjects${query}`);
  },
  async createSubject(subjectData) {
    return await request('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    });
  },
  async updateSubject(id, subjectData) {
    return await request(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData)
    });
  },
  async deleteSubject(id) {
    return await request(`/api/subjects/${id}`, {
      method: 'DELETE'
    });
  },

  // Attendance
  async getAttendance(filter = {}) {
    const params = new URLSearchParams();
    if (filter.date) params.append('date', filter.date);
    if (filter.class) params.append('class', filter.class);
    if (filter.subject) params.append('subject', filter.subject);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/api/attendance${qs}`);
  },
  async saveAttendance(data) {
    return await request('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async clearAttendance() {
    return await request('/api/attendance', {
      method: 'DELETE'
    });
  },

  // Settings
  async getSettings() {
    return await request('/api/settings');
  },
  async updateSettings(settingsData) {
    return await request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  },

  // Backup & Restore
  async exportBackup() {
    return await request('/api/backup/export');
  },
  async importBackup(backupPayload) {
    return await request('/api/backup/import', {
      method: 'POST',
      body: JSON.stringify(backupPayload)
    });
  }
};
