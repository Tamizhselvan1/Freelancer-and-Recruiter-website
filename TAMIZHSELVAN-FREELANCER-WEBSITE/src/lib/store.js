import { v4 as uuidv4 } from 'uuid';

const DB_KEY = 'freelance_app_db';

const initialData = {
  users: [],
  jobs: [],
  notifications: {}, 
  applications: []
};


export const initDatabase = () => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  }
};

const getDB = () => JSON.parse(localStorage.getItem(DB_KEY) || JSON.stringify(initialData));
const setDB = (data) => localStorage.setItem(DB_KEY, JSON.stringify(data));

export const store = {
  getUsers: () => getDB().users,
  getUserById: (id) => getDB().users.find(u => u.id === id),
  addUser: (user) => {
    const db = getDB();
    db.users.push(user);
    setDB(db);
    return user;
  },
  updateUser: (id, updates) => {
    const db = getDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    const updatedUser = { ...db.users[index], ...updates };
    db.users[index] = updatedUser;
    setDB(db);
    return updatedUser;
  },
  findUserByEmail: (email) => getDB().users.find(u => u.email === email),
  
  getJobs: () => getDB().jobs,
  getJobById: (id) => getDB().jobs.find(j => j.id === id),
  addJob: (job) => {
    const db = getDB();
    const newJob = { ...job, id: uuidv4(), postedAt: new Date().toISOString() };
    db.jobs.push(newJob);
    setDB(db);
    return newJob;
  },

  getNotifications: (userId) => getDB().notifications[userId] || [],
  addNotification: (userId, notification) => {
    const db = getDB();
    if (!db.notifications[userId]) db.notifications[userId] = [];
    const base = typeof notification === 'string'
      ? { type: 'info', message: notification }
      : { type: 'info', ...notification };
    db.notifications[userId].push({ id: uuidv4(), read: false, createdAt: new Date().toISOString(), ...base });
    setDB(db);
  },
  markNotificationRead: (userId, notificationId) => {
    const db = getDB();
    const list = db.notifications[userId] || [];
    const notif = list.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      setDB(db);
    }
    return notif;
  },

  
  applyJob: (jobId, freelancerId) => {
      const db = getDB();
      const application = { id: uuidv4(), jobId, freelancerId, status: 'pending', appliedAt: new Date().toISOString() };
      db.applications.push(application);
      setDB(db);
      return application;
  },
  getApplicationById: (applicationId) => getDB().applications.find(app => app.id === applicationId),
  updateApplicationStatus: (applicationId, status) => {
      const db = getDB();
      const application = db.applications.find(app => app.id === applicationId);
      if (application) {
        application.status = status;
        application.updatedAt = new Date().toISOString();
        setDB(db);
      }
      return application;
  },
  getApplicationsForJob: (jobId) => getDB().applications.filter(app => app.jobId === jobId)
};
