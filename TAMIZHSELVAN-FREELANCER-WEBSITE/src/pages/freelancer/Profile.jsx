import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { useAuth } from '@/components/layout/Layout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth(); 
  
  
  
  
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
        
        const freshUser = store.getUsers().find(u => u.id === user.id);
        if (freshUser) {
           setSkills(freshUser.skills ? freshUser.skills.join(', ') : '');
           setBio(freshUser.bio || '');
        }
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!user) return;

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    
    
    
    const db = JSON.parse(localStorage.getItem('freelance_app_db'));
    const userIndex = db.users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        db.users[userIndex].skills = skillsArray;
        db.users[userIndex].bio = bio;
        localStorage.setItem('freelance_app_db', JSON.stringify(db));
        alert('Profile updated! (Relogin to see basic auth changes if any)');
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-lg">
        <form onSubmit={handleSave} className="space-y-6">
          <Input 
             label="Your Name"
             value={user.name}
             disabled
             className="opacity-50"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Skills (Comma separated)</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground h-24 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, Design..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Bio</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground h-32 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-black">
            Save Profile
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
