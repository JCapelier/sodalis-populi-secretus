export function validateSignUp({
  username,
  email,
  password,
  confirmPassword,
}: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): string | null {

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  if (!username.trim()) return 'Name is required';

  if (!usernameRegex.test(username)) return 'Username must use alphanumerical characters and underscores only';

  if (username.trim().length < 3 || username.trim().length > 20) return 'Username must be between 3 and 20 characters';

  if (!email) return 'Email is required';

  if (!emailRegex.test(email)) return 'Invalid email';

  if (!password) return 'Password is required';

  if (!passwordRegex.test(password)) return 'Password must be at least 8 characters long and have at least one number and one letter';

  if (password !== confirmPassword) return 'Password and confirmation do not match';

  return null;
}
