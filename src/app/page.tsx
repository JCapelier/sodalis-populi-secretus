import React from "react";
import Banner from "@/components/Banner";
import SignInForm from "@/components/forms/SignInForm";
import Link from "next/link";

export default function HomePage() {
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
          <Link href="/users/sign-up">
            <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
