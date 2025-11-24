import React, { useState, useRef, useEffect } from "react";
import { ParticipantFormEntry } from "./EventForm";
import { getParentsNames } from "@/lib/api";


type InviteParticipantsFieldProps = {
  onInvite: (user: ParticipantFormEntry) => void;
  searchEndPoint: string;
};



const InviteParticipantsField: React.FC<InviteParticipantsFieldProps> = ({ onInvite, searchEndPoint }) => {

	const [username, setUsername] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<ParticipantFormEntry[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [parentNames, setParentNames] = useState<Record<number, string>>({});
	const inputRef = useRef<HTMLInputElement>(null);

	// Fetch suggestions as user types
	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUsername(value);
		setError(null);
		if (value.trim().length === 0) {
			setSuggestions([]);
			setShowSuggestions(false);
			setParentNames({});
			return;
		}
		try {
			const result = await fetch(`${searchEndPoint}?search=${encodeURIComponent(value)}`);
			const data = await result.json();
			if (result.ok && Array.isArray(data.users)) {
				setSuggestions(data.users);
				setShowSuggestions(true);
				// For each child, fetch parent names
				const childInvitees = data.users.filter((u: any) => u.type === 'child');
				const parentNamePromises = childInvitees.map(async (child: any) => {
					try {
						const res = await fetch(`/api/children/${child.id}/parents`);
						const parentData = await res.json();
            console.log(parentData)
						if (parentData.parent && parentData.otherParent) {
							return [child.id, `${parentData.parent.username} & ${parentData.otherParent.username}`];
						} else if (parentData.parent) {
							return [child.id, parentData.parent.username];
						} else {
							return [child.id, "Unknown parent"];
						}
					} catch {
						return [child.id, "Unknown parent"];
					}
				});
				const parentNameEntries = await Promise.all(parentNamePromises);
				setParentNames(Object.fromEntries(parentNameEntries));
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
				setParentNames({});
			}
		} catch {
			setSuggestions([]);
			setShowSuggestions(false);
			setParentNames({});
		}
	};

	// Handle selecting a suggestion
	const handleSelect = (user: ParticipantFormEntry) => {
		setUsername('');
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
				autoComplete="off"
			/>
			{showSuggestions && (
				<ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto shadow">
						{suggestions.length > 0 ? (
							suggestions.map((invitee) => (
								<li
									key={`${invitee.type}-${invitee.id}`}
									className="px-3 py-2 cursor-pointer hover:bg-blue-100"
									onMouseDown={() => handleSelect(invitee)}
								>
									{invitee.type === 'user'
										? invitee.username
										: `${invitee.username} (child of ${parentNames[invitee.id] || '...'})`}
								</li>
							))
						) : (
							<li className="px-3 py-2 text-gray-500">No users found</li>
						)}
				</ul>
			)}
			{error && <span className="text-red-500 ml-2 text-sm">{error}</span>}
		</div>
	);
};

export default InviteParticipantsField;
