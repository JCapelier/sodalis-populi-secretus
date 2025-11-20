"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/events");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Username</label>
        <input
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
      >
        Sign in
      </button>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
    </form>
  );
}
