import { childRepository } from "@/repositories/ChildRepository";
import { userRepository } from "@/repositories/UserRepository";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const child = await childRepository.findById(id);
    if (!child || !child.other_parent_id) {
      return new Response(JSON.stringify(null), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const otherParent = await userRepository.findById(child.other_parent_id);
    if (!otherParent) {
      return new Response(JSON.stringify(null), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(
      JSON.stringify(otherParent.username),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
