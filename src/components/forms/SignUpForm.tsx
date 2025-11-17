'use client';
import { validateSignUp } from "@/utils/form-validation-helper";
import { useState } from "react";

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const errorMessage = validateSignUp({username, email, password, confirmPassword})
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password,
    };

    const result = await fetch('/api/users/sign-up', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const formData = await result.json();
    if (!result.ok) {
      setError(formData.error || 'Failed to sign user up');
    } else {
      setSuccess('User signed up');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Username:
          <input value={username} onChange={event => setUsername(event.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input value={email} onChange={event => setEmail(event.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input value={password} onChange={event => setPassword(event.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Confirm password:
          <input value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
        </label>
      </div>
      <button type="submit">Sign up</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </form>
  );
}
