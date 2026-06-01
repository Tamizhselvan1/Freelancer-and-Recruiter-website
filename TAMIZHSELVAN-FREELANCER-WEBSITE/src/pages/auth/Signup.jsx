import { useState } from 'react';
import { useAuth } from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import clsx from 'clsx';
import { User, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'freelancer'
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const parseSkills = (value) => value
    .split(',')
    .map(skill => skill.trim())
    .filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const isFreelancer = formData.role === 'freelancer';
    const skills = isFreelancer ? parseSkills(skillsInput) : [];

    if (isFreelancer && skills.length === 0) {
      setError('Please enter at least one skill.');
      return;
    }

    const result = signup({ ...formData, skills });

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const setRole = (role) => {
    setFormData({ ...formData, role });
    if (role !== 'freelancer') setSkillsInput('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-black via-gray-900 to-black px-4">

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >

        <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 shadow-xl shadow-purple-900/40 rounded-2xl p-8">

          <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-wide">
            Create Account
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>

            <div className="grid grid-cols-2 gap-4">
              <RoleCard 
                active={formData.role === 'freelancer'} 
                onClick={() => setRole('freelancer')}
                icon={User}
                label="Freelancer"
              />

              <RoleCard 
                active={formData.role === 'recruiter'} 
                onClick={() => setRole('recruiter')}
                icon={Briefcase}
                label="Recruiter"
              />
            </div>

            <Input
              label="Full Name"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={(e)=>setFormData({...formData, name:e.target.value})}
            />

            <Input
              label="Email"
              placeholder="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e)=>setFormData({...formData, email:e.target.value})}
            />

            <Input
              label="Password"
              placeholder='Password'
              type="password"
              required
              value={formData.password}
              onChange={(e)=>setFormData({...formData, password:e.target.value})}
            />

            {formData.role === 'freelancer' && (
              <Input
                label="Skills (comma separated)"
                placeholder="React, Node.js"
                required
                value={skillsInput}
                onChange={(e)=>setSkillsInput(e.target.value)}
              />
            )}

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-400 hover:bg-blue-500 shadow-lg shadow-purple-900/40 transition-all duration-300"
            >
              Create Account
            </Button>

          </form>
        </div>
      </motion.div>
    </div>
  );
}


/* ✅ ROLE CARD COMPONENT MUST BE BELOW */

function RoleCard({ active, onClick, icon: Icon, label }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "cursor-pointer rounded-xl border p-5 flex flex-col items-center justify-center gap-2 transition-all duration-300",
        active
          ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-800/40 scale-105"
          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-purple-500/30"
      )}
    >
      <Icon className="h-7 w-7" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}