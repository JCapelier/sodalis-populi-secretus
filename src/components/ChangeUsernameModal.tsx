"use client";
import React, { useState } from "react";

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newUsername: string) => Promise<void>;
}

const ChangeUsernameModal: React.FC<ChangeUsernameModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await onSubmit(username);
      setSuccess("Username updated!");
      setUsername("");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-transparent backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border-2 border-blue-400 p-6 rounded-xl shadow-2xl min-w-[350px] max-w-[95vw] flex flex-col items-center z-10">
        <div className="flex justify-between items-center w-full mb-4">
          <span className="font-semibold text-lg text-blue-800">Change Username</span>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl font-bold px-2">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <label className="block text-black font-semibold mb-1">
            New username:
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="block w-full border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white"
              style={{ minWidth: '0' }}
              disabled={loading}
            />
          </label>
          <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 w-full" disabled={loading}>
            {loading ? "Saving..." : "Change Username"}
          </button>
          {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
          {success && <div className="text-green-600 font-semibold mt-2">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default ChangeUsernameModal;
