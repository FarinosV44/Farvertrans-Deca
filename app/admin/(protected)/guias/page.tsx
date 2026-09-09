import { redirect } from "next/navigation";
import { requireInternal } from "@/lib/admin/guard";
export default async function AdminGuias() {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  redirect("/admin/contenido?type=guide");
}
