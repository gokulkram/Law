import ContactFormClient from "@/components/ContactFormClient";
import { getContent } from "@/lib/content-store";

// Case-review form: the interactive part is ContactFormClient; this passes it the case types,
// office names and phone number from the firm details.
export default async function ContactForm({ variant }: { variant: "lead" | "page" }) {
  const { firm } = await getContent();
  return <ContactFormClient variant={variant} caseTypes={firm.caseTypes} offices={firm.offices.map((o) => o.label)} phone={firm.phone} />;
}
