import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { toggleActionComplete } from "@/lib/dal/actions";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, completed } = await request.json();
    if (!taskId || typeof completed !== "boolean") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Verify task belongs to user's brand
    const task = await prisma.actionTask.findUnique({
      where: { id: taskId },
      include: { brand: { include: { profile: true } } },
    });
    if (!task || task.brand.profile?.id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await toggleActionComplete(taskId, completed);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[actions/toggle] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
