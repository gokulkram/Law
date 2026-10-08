import Link from "next/link";
import { PHONE, PHONE_HREF, EMAIL, SOCIAL } from "@/lib/site";

const social = SOCIAL.filter((s) => s.url);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <h4>California Law</h4>
            <p>A California personal injury law firm dedicated to families and the seriously injured - with a focus on wrongful death claims. Compassionate counsel, relentless advocacy.</p>
          </div>
          <div>
            <h4>Practice Areas</h4>
            <ul>
              <li><Link href="/wrongful-death">Wrongful Death</Link></li>
              <li><Link href="/car-accident-lawyer">Car Accidents</Link></li>
              <li><Link href="/truck-accident-lawyer">Truck Accidents</Link></li>
              <li><Link href="/medical-malpractice-lawyer">Medical Malpractice</Link></li>
              <li><Link href="/catastrophic-injury-lawyer">Catastrophic Injury</Link></li>
              <li><Link href="/workplace-injury-lawyer">Workplace Injuries</Link></li>
              <li><Link href="/practice-areas">All Practice Areas</Link></li>
            </ul>
          </div>
          <div>
            <h4>Firm</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/resources">Guides &amp; Resources</Link></li>
              <li><Link href="/#testimonials">Testimonials</Link></li>
              <li><Link href="/contact">Locations</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Get Help Now</h4>
            <p>Available 24/7 for new matters.</p>
            <p style={{ margin: "6px 0" }}><a href={PHONE_HREF} style={{ color: "var(--gold-300)", fontWeight: 700, fontSize: "1.1rem" }}>{PHONE}</a></p>
            <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            {social.length > 0 && (
              <div className="footer__social" style={{ marginTop: 16 }}>
                {social.map((s) => (
                  <a key={s.label} href={s.url} aria-label={s.label} target="_blank" rel="noopener">{s.short}</a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="disclaimer">
          Attorney Advertising. The information on this website is for general informational purposes only and is not legal advice. Viewing this site or contacting the firm does not create an attorney-client relationship. Prior results do not guarantee a similar outcome. Figures shown are illustrative.
        </div>
        <div className="footer__bottom">
          <span>&copy; {new Date().getFullYear()} California Law. All rights reserved.</span>
          <span><Link href="/privacy">Privacy Policy</Link> &nbsp;&middot;&nbsp; <Link href="/disclaimer">Disclaimer</Link> &nbsp;&middot;&nbsp; <Link href="/site-map">Site Map</Link></span>
        </div>
      </div>
    </footer>
  );
}
