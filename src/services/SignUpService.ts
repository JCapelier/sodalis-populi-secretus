import { apiPost } from "@/lib/api";
import { User } from "@/type";
import { signIn } from "next-auth/react";

export class SignUpService {

  static async signUpAndSignIn(username: string, password: string) {
    const payload = { username: username.trim(), password };
    try {
      const newUser = await apiPost<User>('/api/users/sign-up', payload);
      if (newUser && newUser.id) {
        const signInResult = await signIn("credentials", {
          username: payload.username,
          password: payload.password,
          redirect: false,
        });
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
