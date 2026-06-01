import Cookies from 'js-cookie';
import { store } from './store';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'freelance_token';

const buildToken = (user) => JSON.stringify({
  id: user.id,
  email: user.email,
  role: user.role,
  name: user.name,
  skills: user.skills || []
});

export const auth = {
  login: (email, password, options = {}) => {
    const user = store.findUserByEmail(email);
    if (user && user.password === password) { 
      let currentUser = user;
      if (user.role === 'freelancer' && Array.isArray(options.skills)) {
        const updated = store.updateUser(user.id, { skills: options.skills });
        if (updated) currentUser = updated;
      }
      const token = buildToken(currentUser);
      Cookies.set(COOKIE_NAME, token, { expires: 7 }); 
      return { success: true, user: currentUser };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  signup: (userData) => {
    if (store.findUserByEmail(userData.email)) {
      return { success: false, message: 'User already exists' };
    }
    const newUser = { ...userData, id: uuidv4(), skills: userData.skills || [] };
    store.addUser(newUser);
    
    
    const token = buildToken(newUser);
    Cookies.set(COOKIE_NAME, token, { expires: 7 });
    
    return { success: true, user: newUser };
  },

  logout: () => {
    Cookies.remove(COOKIE_NAME);
  },

  getCurrentUser: () => {
    const token = Cookies.get(COOKIE_NAME);
    if (!token) return null;
    try {
      return JSON.parse(token);
    } catch (e) {
      return null;
    }
  }
};
