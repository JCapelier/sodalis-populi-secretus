'use client';
import React, { useState } from "react";
import Banner from "@/components/Banner";
import SignInForm from "@/components/forms/SignInForm";
import SignUpModal from "@/components/SignUpModal";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();

  function handleSignUpSuccess(userId: number) {
    setShowSignUp(false);
    router.push(`/users/${userId}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Banner />
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col items-center gap-6">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          You need to be signed in to organize or participate in an event!
        </h2>
        <SignInForm />
        <div className="text-center text-gray-600">
          Don&apos;t have an account yet?
          <button
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => setShowSignUp(true)}
          >
            Sign up
          </button>
        </div>
      </div>
      <SignUpModal isOpen={showSignUp} onClose={() => setShowSignUp(false)} onSuccess={handleSignUpSuccess} />
    </main>
  );
}
