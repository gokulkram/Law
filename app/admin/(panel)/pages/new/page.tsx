import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import NewPageForm from "./NewPageForm";

export const metadata = { title: "New page" };

export default async function NewPage() {
  await requireStaff("admin", "editor");
  return (
    <>
      <p className="ed-crumbs"><Link href="/admin/pages">Pages</Link> / New</p>
      <h1 className="adm-h1">New page</h1>
      <section className="adm-card ed-narrow">
        <NewPageForm />
      </section>
    </>
  );
}
