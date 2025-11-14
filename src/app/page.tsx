import Link from "next/link";

export default async function HomePage() {
  return (
    <main>
      <h1>Welcome to Sodalis Populi Secretus</h1>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <Link href="/users/sign-up">Sign Up</Link>
        <Link href="/users/sign-in">Sign In</Link>
        <Link href="/events/new">Create New Event</Link>
        <Link href="/events">Event Index</Link>
      </nav>
    </main>
  );
}
