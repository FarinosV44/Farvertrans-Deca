import { redirect } from "next/navigation";
export default function AdminGuias() {
  redirect("/admin/contenido?type=guide");
}
