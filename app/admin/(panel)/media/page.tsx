import { MediaGrid, Uploader } from "@/components/admin/media/MediaLibrary";
import { requireStaff } from "@/lib/admin/auth";
import { listMedia } from "./actions";

export const metadata = { title: "Media" };

export default async function MediaPage() {
  const me = await requireStaff();
  const canEdit = me.role === "admin" || me.role === "editor";
  const items = await listMedia();
  return (
    <>
      <h1 className="adm-h1">Media</h1>
      <p className="adm-muted">Images for attorney photos, office photos and social-sharing images. Choose them from the image fields in the page editor and Site settings.</p>
      {canEdit && (
        <section className="adm-card">
          <h2 className="adm-h2">Upload an image</h2>
          <Uploader />
        </section>
      )}
      <section className="adm-card">
        <h2 className="adm-h2">Library</h2>
        <MediaGrid items={items} canEdit={canEdit} />
      </section>
    </>
  );
}
