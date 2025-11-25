'use client';
import React from "react";
import { useRouter } from "next/navigation";
// Removed UserContext usage
import { useSession, signOut } from "next-auth/react";
import AddChildButton from "./AddChildButton";
import { FaCog } from "react-icons/fa";
import ChangeUsernameModal from "./ChangeUsernameModal";
import { apiPut } from "@/lib/api";
import ChangePasswordModal from "./ChangePasswordModal";

interface DashboardProps {
  childrenList: Array<{ id: number; username?: string; name?: string }>;
}

const Dashboard: React.FC<DashboardProps> = ({ childrenList }) => {
  const { data: session, status } = useSession();
  const [localUsername, setLocalUsername] = React.useState(session?.user?.username || "");
  React.useEffect(() => {
    setLocalUsername(session?.user?.username || "");
  }, [session?.user?.username]);
  const router = useRouter();
  const userId = session?.user?.id ? session.user.id : null;
  const children = childrenList || [];
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [showChangeUsername, setShowChangeUsername] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);

  if (status === "loading") {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow text-center text-gray-700 border-2 border-blue-400">
        Loading your dashboard...
      </div>
    );
  }


    async function handleUsernameChange(newUsername: string) {
      if (!userId) throw new Error("No user ID");
      const payload = { username: newUsername };
      await apiPut(`/api/users/${userId}/username`, payload);
      setLocalUsername(newUsername);
      router.refresh(); // Re-render and refetch server data
    }

    async function handlePasswordChange(oldPassword: string, newPassword: string) {
      if (!userId) throw new Error("No user ID");
      const res = await fetch(`/api/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }
    }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow border-2 border-blue-500 flex flex-col items-center">
      <div className="flex items-center justify-center w-full mb-2">
        <h2 className="text-2xl font-bold text-gray-900 text-center w-full">
          Welcome, <span className="text-blue-700 font-extrabold">{localUsername || "Unknown user"}</span>
        </h2>
        <div className="relative ml-2">
          <button
            className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
            onClick={() => setSettingsOpen((o) => !o)}
            aria-label="Settings"
          >
            <FaCog size={22} />
          </button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                onClick={() => {
                  setShowChangeUsername(true);
                  setSettingsOpen(false);
                }}
              >Change Username</button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                onClick={() => {
                  setShowChangePassword(true);
                  setSettingsOpen(false);
                }}
              >Change Password</button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                onClick={() => {
                  setSettingsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >Log Out</button>
            </div>
          )}
          <ChangeUsernameModal
            isOpen={showChangeUsername}
            onClose={() => setShowChangeUsername(false)}
            onSubmit={handleUsernameChange}
          />
          <ChangePasswordModal
            isOpen={showChangePassword}
            onClose={() => setShowChangePassword(false)}
            onSubmit={handlePasswordChange}
          />
        </div>
      </div>
      {/* Children display */}
      {children.length > 0 && (
        <div className="mb-4 w-full flex flex-col items-center">
          <div className="font-semibold text-gray-700 mb-1">Your children:</div>
          <ul className="flex flex-wrap gap-2 justify-center">
            {children.map((child) => (
              <li key={child.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {child.username || child.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      <AddChildButton userId={userId ? Number(userId) : null} />
    </div>
  );
};

export default Dashboard;
