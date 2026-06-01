import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { useAuth } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import axios from "axios";

const FILTER_KEY = "freelance_recruiter_filters";

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [skillFilter, setSkillFilter] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (typeof parsed.skillFilter === "string")
        setSkillFilter(parsed.skillFilter);

      if (typeof parsed.sortBy === "string")
        setSortBy(parsed.sortBy);
    } catch {
      setSkillFilter("");
      setSortBy("match");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      FILTER_KEY,
      JSON.stringify({ skillFilter, sortBy })
    );
  }, [skillFilter, sortBy]);

  useEffect(() => {
    if (user) {
      const allJobs = store.getJobs().filter(
        (j) => j.recruiterId === user.id
      );

      setJobs(allJobs);

      const allFreelancers = store
        .getUsers()
        .filter((u) => u.role === "freelancer");

      setFreelancers(allFreelancers);
    }
  }, [user]);

  if (user?.role !== "recruiter") return null;

  // -----------------------------
  // Accept / Reject API
  // -----------------------------

  const updateApplicationStatus = async (appId, status) => {
    try {
      setLoadingId(appId);

      await axios.put(
        `http://localhost:8000/application/${appId}`,
        {
          status: status,
        }
      );

      alert(`Application ${status}`);

      setLoadingId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update application");
      setLoadingId(null);
    }
  };

  // -----------------------------
  // Skill Filter Logic
  // -----------------------------

  const filterTerms = skillFilter
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

  const normalizedFreelancers = freelancers.map((freelancer) => {
    const skills = Array.isArray(freelancer.skills)
      ? freelancer.skills
      : typeof freelancer.skills === "string"
      ? freelancer.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    const normalizedSkills = skills.map((skill) =>
      String(skill).toLowerCase()
    );

    const matchCount = filterTerms.length
      ? filterTerms.reduce((count, term) => {
          return normalizedSkills.some((skill) =>
            skill.includes(term)
          )
            ? count + 1
            : count;
        }, 0)
      : 0;

    return {
      user: freelancer,
      skills,
      skillsCount: skills.length,
      matchCount,
    };
  });

  const visibleFreelancers = normalizedFreelancers
    .filter((item) =>
      filterTerms.length ? item.matchCount > 0 : true
    )
    .sort((a, b) => {
      const nameA = a.user.name || "";
      const nameB = b.user.name || "";

      if (sortBy === "name") return nameA.localeCompare(nameB);

      if (sortBy === "skills")
        return (
          b.skillsCount - a.skillsCount ||
          nameA.localeCompare(nameB)
        );

      return (
        b.matchCount - a.matchCount ||
        b.skillsCount - a.skillsCount ||
        nameA.localeCompare(nameB)
      );
    });

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
      </div>

      {/* FILTER */}

      <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Filter by skill"
            placeholder="React, Node, UX"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56">
          <label className="text-sm text-muted-foreground">
            Sort by
          </label>

          <select
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="match">Best skill match</option>
            <option value="skills">Most skills</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* FREELANCERS */}

      {visibleFreelancers.length === 0 ? (
        <p>No freelancers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {visibleFreelancers.map(({ user: freelancer, skills }) => (

            <motion.div
              key={freelancer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-5"
            >

              <h3 className="text-lg font-semibold">
                {freelancer.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {freelancer.email}
              </p>

              {/* SKILLS */}

              <div className="mt-3 flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-white/10 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No skills listed
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}

              <div className="flex gap-3 mt-4">

                <button
                  onClick={() =>
                    updateApplicationStatus(
                      freelancer.id,
                      "accepted"
                    )
                  }
                  disabled={loadingId === freelancer.id}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    updateApplicationStatus(
                      freelancer.id,
                      "rejected"
                    )
                  }
                  disabled={loadingId === freelancer.id}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>

              </div>

            </motion.div>

          ))}

        </div>
      )}

      {/* JOBS */}

      <h2 className="text-xl font-semibold text-muted-foreground">
        My Posted Jobs
      </h2>

      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        jobs.map((job) => (

          <motion.div
            key={job.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >

            <h3 className="text-xl font-bold">
              {job.title}
            </h3>

            <p className="text-sm text-muted-foreground">
              Posted on{" "}
              {new Date(job.postedAt).toLocaleDateString()}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-white/10 px-2 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>

          </motion.div>

        ))
      )}

    </div>
  );
}