import EditEventForm from "@/components/forms/EditEventForm";

export default async function EditEventPage({ params }) {
  const { id } = await params;
  return <EditEventForm idString={id} />;
}
