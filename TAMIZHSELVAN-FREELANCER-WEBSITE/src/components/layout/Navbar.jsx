import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './Layout';
import { motion } from 'framer-motion';
import { Briefcase, User, LogOut, Bell, PlusCircle } from 'lucide-react';
import clsx from 'clsx';
import { store } from '@/lib/store';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              FreelanceFlow
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                {user.role === 'recruiter' && (
                  <NavLink to="/post-job" active={isActive('/post-job')} icon={PlusCircle}>
                    Post Job
                  </NavLink>
                )}
                {user.role === 'freelancer' && (
                  <NavLink to="/feed" active={isActive('/feed')} icon={Briefcase}>
                    Jobs
                  </NavLink>
                )}
                
                <NotificationDropdown userId={user.id} />

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                   <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                   </div>
                   <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-red-400 transition-colors"
                   >
                     <LogOut className="h-5 w-5" />
                   </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children, active, icon: Icon }) {
  return (
    <Link 
      to={to} 
      className={clsx(
        "flex items-center gap-2 text-sm font-medium transition-colors relative px-3 py-2 rounded-md",
        active ? "text-foreground bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      {active && (
        <motion.div 
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full"
        />
      )}
    </Link>
  );
}

function NotificationDropdown({ userId }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    
    const interval = setInterval(() => {
        const notifs = store.getNotifications(userId);
        setNotifications(notifs);
    }, 2000); 
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleConfirm = (notification) => {
    if (!user || notification.type !== 'application') return;
    const application = store.updateApplicationStatus(notification.applicationId, 'accepted');
    if (!application) return;

    store.markNotificationRead(user.id, notification.id);

    if (notification.freelancerId) {
      const jobTitle = notification.jobTitle || 'your job';
      store.addNotification(notification.freelancerId, {
        type: 'application-accepted',
        message: `${user.name} accepted your application for ${jobTitle}`,
        applicationId: notification.applicationId,
        jobId: notification.jobId,
        recruiterId: user.id,
        recruiterName: user.name,
      });
    }

    setNotifications(store.getNotifications(user.id));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
           <span className="absolute top-1 right-1 h-2 w-2 bg-pink-500 rounded-full flex items-center justify-center text-[10px] text-white">
             {}
           </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1a1b26] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-3 border-b border-white/10 bg-white/5">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
            ) : (
                notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-gray-300">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </div>
                          {user?.role === 'recruiter' && n.type === 'application' && (
                            store.getApplicationById(n.applicationId)?.status === 'pending' ? (
                              <button
                                onClick={() => handleConfirm(n)}
                                className="shrink-0 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 hover:bg-emerald-500/30 transition-colors"
                              >
                                OK
                              </button>
                            ) : (
                              <span className="shrink-0 text-xs text-emerald-300 font-semibold">Confirmed</span>
                            )
                          )}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

