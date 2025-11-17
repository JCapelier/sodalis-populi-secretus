import { Event } from "@/type";
import React from "react";


export default function EventDetails({event} : {event: Event}) {
	return (
		<section className="event-details border rounded p-4 bg-white shadow">
			<h2 className="text-2xl font-bold mb-2">{event.name}</h2>
			{event.price_limit_cents && <p className="mb-2 text-gray-700">{event.price_limit_cents/100}€</p>}
			<div className="mb-1 text-sm text-gray-500">
				<span className="font-semibold">Date:</span> {event.ends_at ? new Date(event.ends_at).toLocaleString() : "N/A"}
			</div>
		</section>
	);
};
