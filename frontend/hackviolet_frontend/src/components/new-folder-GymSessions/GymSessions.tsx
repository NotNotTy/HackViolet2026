import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import "./GymSessions.css";

type GymSession = {
  id: number;
  workoutType: string;
  dateTime: string;
  location: string;
  partySize: string;
  experienceLevel: string;
  genderPreference?: string;
  notes?: string;
};

type FormData = {
  workoutType: string;
  dateTime: string;
  location: string;
  partySize: string;
  experienceLevel: string;
  genderPreference: string;
  notes: string;
};

export default function GymSessions(): React.ReactElement {
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [archivedSessions, setArchivedSessions] = useState<GymSession[]>([]);
  const [formData, setFormData] = useState<FormData>({
    workoutType: "",
    dateTime: "",
    location: "",
    partySize: "",
    experienceLevel: "Beginner",
    genderPreference: "",
    notes: "",
  });

  useEffect(() => {
    const now = new Date();
    const upcoming = sessions.filter((s: GymSession) => new Date(s.dateTime) > now);
    const expired = sessions.filter((s: GymSession) => new Date(s.dateTime) <= now);

    if (expired.length > 0) {
      setArchivedSessions((prev: GymSession[]) => [...prev, ...expired]);
      setSessions(upcoming);
    }
  }, [sessions]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const newSession: GymSession = {
      id: Date.now(),
      workoutType: formData.workoutType,
      dateTime: formData.dateTime,
      location: formData.location,
      partySize: formData.partySize,
      experienceLevel: formData.experienceLevel,
      genderPreference: formData.genderPreference || undefined,
      notes: formData.notes || undefined,
    };
    setSessions([...sessions, newSession]);
    setFormData({
      workoutType: "",
      dateTime: "",
      location: "",
      partySize: "",
      experienceLevel: "Beginner",
      genderPreference: "",
      notes: "",
    });
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="title">Gym session Request</h1>
        <p className="subtitle">Create and post workout sessions with the community.</p>
      </header>
      
      <div className="content">

        <h2>Create a Session</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="workoutType"
          placeholder="Workout Type"
          value={formData.workoutType}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="location"
          placeholder="Gym Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="partySize"
          placeholder="Party Size (e.g., 1-on-1, Group)"
          value={formData.partySize}
          onChange={handleChange}
          required
        />
        <br /><br />

        <select
          name="experienceLevel"
          value={formData.experienceLevel}
          onChange={handleChange}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <br /><br />

        <input
          name="genderPreference"
          placeholder="Gender Preference (Optional)"
          value={formData.genderPreference}
          onChange={handleChange}
        />
        <br /><br />

        <textarea
          name="notes"
          placeholder="Notes (Optional)"
          value={formData.notes}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Post Session</button>
      </form>
      </div>
    </div>
  );
}
