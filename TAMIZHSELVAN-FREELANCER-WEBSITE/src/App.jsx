import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout, { useAuth } from '@/components/layout/Layout';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import PostJob from '@/pages/recruiter/PostJob';
import RecruiterDashboard from '@/pages/recruiter/RecruiterDashboard';
import JobFeed from '@/pages/freelancer/JobFeed';
import Profile from '@/pages/freelancer/Profile';
import { initDatabase } from '@/lib/store';

initDatabase();

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'recruiter') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/feed" replace />;
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/dashboard" element={<RecruiterDashboard />} />
          <Route path="/feed" element={<JobFeed />} />
          <Route path="/freelancer/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}
