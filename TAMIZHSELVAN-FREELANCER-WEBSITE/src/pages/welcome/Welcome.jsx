import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { useAuth } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function JobFeed() {

  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (user) {
      const allJobs = store.getJobs();
      setJobs(allJobs);
    }
  }, [user]);

  const darkAlert = (options) => {
    return Swal.fire({
      background: '#0f172a',
      color: '#e5e7eb',
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#374151',
      customClass: {
        popup: 'rounded-xl',
        title: 'text-purple-400 text-xl',
        confirmButton: 'px-4 py-2',
      },
      ...options
    });
  };

  const handleApply = async (jobId) => {

    if (!user) {
      darkAlert({
        icon: 'error',
        title: 'Login Required',
        text: 'Please login to apply for a job!',
      });
      return;
    }

    const job = jobs.find(j => j.id === jobId);

    const result = await darkAlert({
      title: 'Apply for Job?',
      text: `Do you want to apply for ${job.title}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Apply!',
    });

    if (!result.isConfirmed) return;

    try {

      const application = store.applyJob(jobId, user.id);

      if (!application) {
        darkAlert({
          icon: 'warning',
          title: 'Already Applied!',
          text: 'You have already applied for this job.',
        });
        return;
      }

      store.addNotification(job.recruiterId, {
        type: 'application',
        message: `Freelancer ${user.name} applied to your job: ${job.title}`,
        applicationId: application.id,
        jobId: job.id,
        jobTitle: job.title,
        freelancerId: user.id,
        freelancerName: user.name,
      });

      darkAlert({
        icon: 'success',
        title: 'Applied Successfully!',
        text: `You applied for ${job.title}`,
      });

    } catch (error) {
      darkAlert({
        icon: 'error',
        title: 'Application Failed',
        text: 'Something went wrong!',
      });
    }
  };

  if (user?.role !== 'freelancer') return null;

  return (
    <div className="min-h-screen from-[#020617] via-[#0f172a] to-[#020617] p-10">

      {/* 🔥 NAVIGATION BAR */}
      <div className="flex justify-center items-center mb-10">
        <h1 className="text-4xl font-bold text-purple-400">
          Job Feed
        </h1>
      </div>

      {/* 🔥 JOB LIST */}
      <div className="grid gap-8">

        {jobs.map(job => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="
              backdrop-blur-lg
              bg-white/5
              border border-purple-500/20
              rounded-2xl
              p-6
              shadow-lg
              hover:shadow-purple-900/40
              hover:border-purple-500/60
              transition
            "
          >

            <div className="flex justify-between items-start">

              <div>
                <h3 className="text-2xl font-bold text-white">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Posted by {job.recruiterName}
                </p>
              </div>

              <span className="
                bg-purple-700/30
                text-purple-300
                px-4 py-1
                rounded-full
                text-sm
                font-semibold
              ">
                {job.budget}
              </span>

            </div>

            <p className="mt-4 text-gray-300">
              {job.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {job.skills.map(skill => (
                <span
                  key={skill}
                  className="
                    text-xs
                    bg-purple-800/30
                    text-purple-300
                    px-2 py-1
                    rounded
                  "
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => handleApply(job.id)}
                className="bg-blue-500 hover:bg-blue-700 text-black"
              >
                Apply Now
              </Button>
            </div>

          </motion.div>
        ))}

        {jobs.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No jobs available at the moment.
          </p>
        )}

      </div>
    </div>
  );
}