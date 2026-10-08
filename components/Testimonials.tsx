"use client";

import { useEffect, useState } from "react";
import { TESTIMONIALS } from "@/content/credibility";

const ITEMS = TESTIMONIALS;

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [tick, setTick] = useState(0); // bumps on manual navigation to restart the timer

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ITEMS.length), 6000);
    return () => clearInterval(t);
  }, [tick]);

  return (
    <section className="section testimonials" id="testimonials">
      <div className="container">
        <div className="section-head center reveal">
          <span className="eyebrow eyebrow--light">Client Stories</span>
          <h2>Families we&rsquo;ve stood beside</h2>
        </div>
        <div className="tslider reveal">
          <span className="tquote-mark" aria-hidden="true">&ldquo;</span>
          {ITEMS.map((t, idx) => (
            <div key={t.who} className={`tslide${idx === i ? " active" : ""}`}>
              <div className="stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="tauthor">
                <span className="tavatar" aria-hidden="true">{t.initials}</span>
                <div className="tauthor__txt">
                  <div className="who">{t.who}</div>
                  <div className="case">{t.kind}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="tdots" role="tablist" aria-label="Testimonial navigation">
            {ITEMS.map((t, idx) => (
              <button
                key={t.who}
                aria-label={`Show testimonial ${idx + 1}`}
                className={idx === i ? "active" : undefined}
                onClick={() => {
                  setI(idx);
                  setTick((n) => n + 1);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
