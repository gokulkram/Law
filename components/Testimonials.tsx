import TestimonialsClient from "@/components/TestimonialsClient";
import { getContent } from "@/lib/content-store";

// Testimonial slider (home page), from Site settings. Hidden when there are none.
export default async function Testimonials() {
  const { credibility } = await getContent();
  if (!credibility.testimonials.length) return null;
  return <TestimonialsClient items={credibility.testimonials} />;
}
