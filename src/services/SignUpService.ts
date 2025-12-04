import { apiPost } from "@/lib/api";
import { User } from "@/type";
import { signIn } from "next-auth/react";

export class SignUpService {
  static validateSignUp({
    username,
    password,
    confirmPassword,
  }: {
    username: string;
    password: string;
    confirmPassword: string;
  }): string | null {

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!username.trim()) return 'Name is required';

    if (!usernameRegex.test(username)) return 'Username must use alphanumerical characters and underscores only';

    if (username.trim().length < 3 || username.trim().length > 20) return 'Username must be between 3 and 20 characters';

    if (!password) return 'Password is required';

    if (!passwordRegex.test(password)) return 'Password must be at least 8 characters long and have at least one number and one letter';

    if (password !== confirmPassword) return 'Password and confirmation do not match';

    return null;
  }

  static async signUpAndSignIn(username: string, password: string) {
    const payload = { username: username.trim(), password };
    try {
      const newUser = await apiPost<User>('/api/users/sign-up', payload);
      if (newUser && newUser.id) {
        console.log("Before signIn");
        const signInResult = await signIn("credentials", {
          username: payload.username,
          password: payload.password,
          redirect: false,
        });
        console.log("After signIn", signInResult);
        return { userId: newUser.id };
      }
      return { error: 'User created but could not sign in' };
    } catch (error: unknown) {
      let message = 'Failed to sign user up';
      if (error instanceof Error) {
        message = error.message;
      }
      return { error: message };
    }
  }
}
