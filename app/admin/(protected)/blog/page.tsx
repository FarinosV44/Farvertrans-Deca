import { redirect } from "next/navigation";
export default function AdminBlog() {
  redirect("/admin/contenido?type=blog");
}
