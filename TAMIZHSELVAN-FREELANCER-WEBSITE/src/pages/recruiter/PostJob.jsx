import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '@/lib/store';
import { useAuth } from '@/components/layout/Layout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    skills: '' 
  });

  if (user?.role !== 'recruiter') return null; 

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    
    store.addJob({
      ...formData,
      skills: skillsArray,
      recruiterId: user.id,
      recruiterName: user.name
    });
    
    
    const allFreelancers = store.getUsers().filter(u => u.role === 'freelancer');
    allFreelancers.forEach(f => {
      const freelancerSkills = f.skills || [];
      const match = skillsArray.some(s => freelancerSkills.includes(s));
      if (match) {
        store.addNotification(f.id, `New job matches your skills: ${formData.title}`);
      }
    });

    navigate('/dashboard');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Job Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g. Senior React Developer"
          />
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <textarea
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground h-32 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the job requirements..."
            />
          </div>

          <Input 
            label="Required Skills (Comma separated)"
            required
            value={formData.skills}
            onChange={(e) => setFormData({...formData, skills: e.target.value})}
            placeholder="React, Node.js, TailwindCSS"
          />

          <Input 
            label="Budget"
            required
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: e.target.value})}
            placeholder="e.g. $5000"
          />

          <Button type="submit" className="w-full bg-purple-800 hover:bg-purple-500 text-black">
            Post Job
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
