import EventForm from "@/components/forms/EventForm";

export default async function EditEventPage({ params }) {
  const { id } = await params;
  return <EventForm idString={id} />;
}
