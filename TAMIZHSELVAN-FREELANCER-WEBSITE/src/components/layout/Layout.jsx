import { useEffect, useState, createContext, useContext } from 'react';
import Navbar from './Navbar';
import { auth } from '@/lib/auth';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    
    const publicRoutes = ['/', '/login', '/signup'];
    if (!currentUser && !publicRoutes.includes(location.pathname)) {
      navigate('/login');
    }
  }, [location.pathname]);

  const login = (email, password, options) => {
    const result = auth.login(email, password, options);
    if (result.success) {
      setUser(result.user);
      return { success: true, user: result.user };
    }
    return result;
  };

  const signup = (data) => {
    const result = auth.signup(data);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return result;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-500/30">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           {children}
        </main>
      </div>
    </AuthContext.Provider>
  );
}
