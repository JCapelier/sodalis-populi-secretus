import { InviteeService } from "@/services/InviteeService";
import { ChildIdAndParentsUsernames, InviteeSearchResult, Participant } from "@/type";
import { suggestionText } from "@/utils/invitee-utils";
import React, { useState, useRef } from "react";

type InviteParticipantsFieldProps = {
	onInvite: (user: Participant) => void;
	searchEndPoint: string;
	prefill?: Participant;
};


const InviteParticipantsField: React.FC<InviteParticipantsFieldProps> = ({ onInvite, searchEndPoint, prefill }) => {
	const [username, setUsername] = useState(prefill?.username || "");
	const [error, setError] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<{ invitee: InviteeSearchResult, parentsInfo: ChildIdAndParentsUsernames | null }[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Always reflect prefill in the input value
	React.useEffect(() => {
    if (prefill && prefill.username) {
			setUsername(prefill.username);
			onInvite(prefill);
		} else if (!prefill) {
			setUsername("");
		}
	}, [prefill, onInvite]);

	// Fetch suggestions as user types
	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const search = e.target.value;
		setUsername(search);
		setError(null);
		if (search.trim().length === 0) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}
		try {
			const newSuggestions = await InviteeService.getSuggestions(searchEndPoint, search);
      if (newSuggestions) {
				setSuggestions(newSuggestions);
				setShowSuggestions(true);
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		} catch {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	};

	// Handle selecting a suggestion
	const handleSelect = (user: InviteeSearchResult) => {
		setUsername(user.username);
		setSuggestions([]);
		setShowSuggestions(false);
		// Map API result to correct structure
		onInvite({
			invitee_id: user.id,
			username: user.username,
			type: user.type,
		});
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
				onChange={prefill ? undefined : handleInputChange}
				onFocus={() => setShowSuggestions(suggestions.length > 0)}
				onBlur={handleBlur}
				placeholder="Enter username to invite"
				className="border rounded px-2 py-1 w-full text-black"
				autoComplete="off"
				disabled={!!prefill}
			/>
			{showSuggestions && (
				<ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto shadow">
						{suggestions.length > 0 ? (
							suggestions.map((suggestion) => (
								<li
									key={`${suggestion.invitee.type}-${suggestion.invitee.id}`}
									className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-black"
									onMouseDown={() => handleSelect(suggestion.invitee)}
								>
                  {suggestionText(suggestion)}
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
