import { PageHeader, BackLink } from "@/components/admin/ui";
import { ContentEditor } from "@/components/admin/content-editor";

export default function NuevoContenido() {
  return (
    <div className="space-y-5">
      <BackLink href="/admin/contenido">Contenido</BackLink>
      <PageHeader
        title="Nuevo contenido"
        lead="Se guarda como borrador. Publícalo cuando esté listo."
      />
      <ContentEditor />
    </div>
  );
}
