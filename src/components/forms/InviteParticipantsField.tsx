import React, { useState, useRef } from "react";

type InviteParticipantsFieldProps = {
  onInvite: (user: { id: number; username: string }) => void;
};



const InviteParticipantsField: React.FC<InviteParticipantsFieldProps> = ({ onInvite }) => {
  console.log('coucou')
  const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<{ id: number; username: string }[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Fetch suggestions as user types
	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
		setUsername(value);
		setError(null);
		if (value.trim().length === 0) {
      setSuggestions([]);
			setShowSuggestions(false);
			return;
		}
		setLoading(true);
		try {
      const res = await fetch(`/api/users/autocomplete?search=${encodeURIComponent(value)}`);
			const data = await res.json();
			if (res.ok && Array.isArray(data.users)) {
        setSuggestions(data.users);
				setShowSuggestions(true);
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		} catch {
			setSuggestions([]);
			setShowSuggestions(false);
		} finally {
			setLoading(false);
		}
	};

	// Handle selecting a suggestion
	const handleSelect = (user: { id: number; username: string }) => {
		setUsername(user.username);
		setSuggestions([]);
		setShowSuggestions(false);
		onInvite(user);
	};

	// Hide suggestions when input loses focus (with a slight delay for click)
	const handleBlur = () => {
		setTimeout(() => setShowSuggestions(false), 100);
	};


	return (
    <div className="relative mt-4">
			<input
				ref={inputRef}
				type="text"
				value={username}
				onChange={handleInputChange}
				onFocus={() => setShowSuggestions(suggestions.length > 0)}
				onBlur={handleBlur}
				placeholder="Enter username to invite"
				className="border rounded px-2 py-1 w-full"
				disabled={loading}
				required
				autoComplete="off"
			/>
			{showSuggestions && suggestions.length > 0 && (
				<ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto shadow">
					{suggestions.map((user) => (
						<li
							key={user.id}
							className="px-3 py-2 cursor-pointer hover:bg-blue-100"
							onMouseDown={() => handleSelect(user)}
						>
							{user.username}
						</li>
					))}
				</ul>
			)}
			{error && <span className="text-red-500 ml-2 text-sm">{error}</span>}
		</div>
	);
};

export default InviteParticipantsField;
