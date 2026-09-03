import Link from "next/link";
import { es } from "@/lib/i18n/es";

export default function NotFound() {
  return (
    <main id="contenido" className="mx-auto max-w-[1120px] px-4 py-24 md:px-6">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">{es.errors.notFound}</p>
      <Link href="/" className="mt-6 inline-block underline">
        Volver al inicio
      </Link>
    </main>
  );
}
