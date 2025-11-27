"use client";
import React from "react";
import SignUpForm from "@/components/forms/SignUpForm";


interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: number) => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>
        <SignUpForm onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default SignUpModal;
