import EditEventForm from "@/components/EditEventForm";

export default async function EditEventPage({ params }) {
  const { id } = await params;
  return <EditEventForm idString={id} />;
}
