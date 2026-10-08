import Link from "next/link";
import { barProfileUrl, getAttorney } from "@/content/attorneys";

export const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// "Last updated …" plus, when a real attorney reviewed the page, "Legal review by …" with their
// State Bar number linked to the official profile.
export default function Byline({ updated, published, reviewedBy, reviewed }: { updated: string; published?: string; reviewedBy?: string; reviewed?: string }) {
  const attorney = getAttorney(reviewedBy);
  return (
    <p className="byline">
      {published && published !== updated ? <>Published {fmtDate(published)} &middot; </> : null}
      Last updated {fmtDate(updated)}
      {attorney && (
        <>
          <br />
          Legal review by <Link href={`/attorneys/${attorney.slug}`}>{attorney.name}</Link>, State Bar of California{" "}
          <a href={barProfileUrl(attorney.barNumber)} target="_blank" rel="noopener">#{attorney.barNumber}</a>
          {reviewed ? <> &middot; {fmtDate(reviewed)}</> : null}
        </>
      )}
    </p>
  );
}
