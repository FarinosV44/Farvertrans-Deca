import { NextResponse } from "next/server";
import { z } from "zod";
import { isInternalRequest } from "@/lib/admin/guard";
import { createOperator } from "@/lib/admin/operators";

export const runtime = "nodejs";

/** Create an operator / commercial / collaborator (#86 part 8). */
export async function POST(req: Request) {
  if (!(await isInternalRequest(req.headers))) {
    return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  }
  try {
    const op = await createOperator(await req.json().catch(() => ({})));
    return NextResponse.json({ id: op.id, refCode: op.refCode }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "validation", fields: e.flatten().fieldErrors } },
        { status: 422 },
      );
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
