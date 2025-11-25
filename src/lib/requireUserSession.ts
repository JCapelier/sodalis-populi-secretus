import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function requireUserSession(userId: number) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || Number(session.user.id) !== userId) {
    redirect(`/?callbackUrl=${encodeURIComponent(`/users/${userId}`)}`);
  }
  return session;
}
