import { useState } from 'react';
import { useAuth } from '@/components/layout/Layout';
import { useNavigate, Link } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const parseSkills = (value) =>
    value
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError("Please select your role.");
      return;
    }

    const skills = role === 'freelancer' ? parseSkills(skillsInput) : [];

    if (role === 'freelancer' && skills.length === 0) {
      setError('Please enter at least one skill.');
      return;
    }

    const result = login(email, password, role, skills);

    // ❌ Account does not exist
    if (!result.success) {
      setError("Account not found. Please create an account!");
      return;
    }

    // ❌ Role mismatch
    if (result.user.role !== role) {
      setError(`You are registered as ${result.user.role}. Please login using correct role.`);
      return;
    }

    // ✅ Successful Login
    if (role === 'recruiter') {
      navigate('/dashboard');
    } 
    else if (role === 'freelancer') {
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-black via-gray-900 to-black px-4">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 shadow-2xl shadow-purple-900/40 rounded-2xl p-8">

          <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-wide">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ROLE */}
            <div>
              <label className="text-sm text-purple-400 font-medium">
                Select Role
              </label>

              <select
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-2 px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
              >
                <option value="">Choose your role</option>
                <option value="recruiter">Recruiter</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>

            {/* EMAIL */}
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD */}
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* SKILLS (ONLY FREELANCER) */}
            {role === 'freelancer' && (
              <Input
                label="Skills (comma separated)"
                placeholder="React, Node.js"
                required
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">
                {error}
                <div className="mt-2">
                  <Link
                    to="/signup"
                    className="text-blue-400 hover:text-blue-500 underline"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-400 hover:bg-purple-800 transition-all duration-300 shadow-lg shadow-purple-900/40"
            >
              Sign In
            </Button>

          </form>

          <p className="text-gray-400 text-sm text-center mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-500 transition"
            >
              Signup
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
}