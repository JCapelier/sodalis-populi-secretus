'use client';
import { useState } from "react";
import { SignUpService } from "@/services/SignUpService";
import { validateSignUp } from "@/utils/validate-sign-up";

interface SignUpFormProps {
  onSuccess?: (userId: number) => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const errorMessage = validateSignUp({ username, password, confirmPassword });
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const result = await SignUpService.signUpAndSignIn(username, password);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("User signed up");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      if (onSuccess && result.userId) {
        onSuccess(result.userId);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Username</label>
        <input
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          value={username}
          onChange={event => setUsername(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Confirm password</label>
        <input
          type="password"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
      >
        Sign up
      </button>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      {success && <div className="text-green-600 text-sm text-center">{success}</div>}
    </form>
  );
}
