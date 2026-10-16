import { notFound } from "next/navigation";
import PageEditor, { type EditorPage, type Revision } from "@/components/admin/editor/PageEditor";
import { requireStaff } from "@/lib/admin/auth";
import { protectedReason, referencesTo } from "@/lib/admin/page-model";
import { allPagesLite, PAGE_COLUMNS, pageName, validationContext, type PageRow } from "@/lib/admin/pages";
import { getContent } from "@/lib/content-store";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit page" };

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const me = await requireStaff();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();

  const [{ data: row }, { data: revs }, pages, { data: profile }] = await Promise.all([
    supabase.from("pages").select(PAGE_COLUMNS).eq("id", id).maybeSingle(),
    supabase.from("page_revisions").select("id, note, created_at, created_by").eq("page_id", id).order("created_at", { ascending: false }).limit(30),
    allPagesLite(),
    supabase.from("profiles").select("attorney_slug").eq("id", me.id).single(),
  ]);
  if (!row) notFound();
  const page = row as PageRow;

  // Names for "who saved this" in the history list.
  const authorIds = [...new Set((revs ?? []).map((r) => r.created_by).filter(Boolean))] as string[];
  const { data: authors } = authorIds.length ? await supabase.from("profiles").select("id, full_name, email").in("id", authorIds) : { data: [] };
  const authorName = new Map((authors ?? []).map((a) => [a.id, a.full_name || a.email]));
  const revisions: Revision[] = (revs ?? []).map((r) => ({ id: r.id, note: r.note, created_at: r.created_at, by: r.created_by ? authorName.get(r.created_by) ?? null : null }));

  const options = pages.map((p) => ({ path: p.path, name: pageName(p), type: p.type }));
  const attorneys = pages
    .filter((p) => p.type === "attorney" && p.status === "published" && p.published_content)
    .map((p) => ({ slug: p.path.split("/")[2], name: pageName(p) }));
  // Links from other pages, in either their draft or their live text.
  const references = referencesTo(page.path, pages.flatMap((p) => [
    { path: p.path, name: pageName(p), content: p.content },
    ...(p.published_content ? [{ path: p.path, name: pageName(p), content: p.published_content }] : []),
  ])).filter((r, i, all) => all.findIndex((x) => x.path === r.path) === i);

  return (
    <PageEditor
      key={page.id}
      page={page as EditorPage}
      role={me.role}
      options={options}
      ctx={await validationContext(pages)}
      revisions={revisions}
      attorneys={attorneys}
      myAttorney={profile?.attorney_slug ?? null}
      references={references}
      protectedReason={protectedReason(page.type, page.path)}
      offices={(await getContent()).firm.offices.map((o) => ({ id: o.id, label: o.label }))}
    />
  );
}
