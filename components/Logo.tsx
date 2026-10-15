import Image from "next/image";

// Client-supplied brand logo. The script is white, so on light backgrounds (the header)
// the original artwork is shown on its own navy plate; on navy backgrounds (the footer)
// a transparent cut-out of the same artwork is used.
export default function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return tone === "dark" ? (
    <Image className="logo logo--plate" src="/assets/logo-header.webp" alt="California Law" width={760} height={320} loading="eager" />
  ) : (
    <Image className="logo" src="/assets/logo-footer.png" alt="California Law" width={705} height={293} />
  );
}
