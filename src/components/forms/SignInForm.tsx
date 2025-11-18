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
      router.push("/");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Username:
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
      </div>
      <button type="submit">Sign in</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
