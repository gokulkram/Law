# Service page topic map

Each page *owns* its topic. Other pages mention an owned topic in one or two sentences and link to
the owner instead of repeating it. File name = slug without the leading "/", with "/" → "--"
(e.g. `/wrongful-death/car-accident` → `content/services/wrongful-death--car-accident.ts`).

Paired pages must not compete in search: the **wrongful-death** page is about the *family's* claim after
a death (who files, wrongful death vs. survival damages, one action for all heirs); the **main** page is
about the *injured person's* own claim. Different title, H1 and opening; link to each other.

## Group: Wrongful Death  (group: "Wrongful Death"; breadcrumb parent /wrongful-death)
| Slug | Name | Owns / focus | Search focus |
|---|---|---|---|
| /wrongful-death/car-accident | Fatal Car Accidents | Family's claim after a fatal car crash; criminal case vs civil claim; insurance limits after a death; evidence | "fatal car accident lawyer California" |
| /wrongful-death/truck-accident | Fatal Truck Accidents | Family's claim after a fatal truck crash; trucking company liability; federal hours-of-service, ELD/black box preservation | "fatal truck accident lawyer California" |
| /wrongful-death/medical-malpractice | Medical Malpractice Deaths | Death from medical negligence; MICRA death cap ($650,000 in 2026; separate caps); §340.5 deadline; §364 90-day notice | "medical malpractice wrongful death California" |
| /wrongful-death/workplace | Workplace Deaths | Workers' comp death benefits vs wrongful death; §3602 exceptions; third-party claims (contractors, equipment makers) | "workplace death lawyer California" |
| /wrongful-death/who-can-file | Who Can File | **Owns CCP §377.60** in full: spouse, domestic partner, children, intestate heirs, dependents (putative spouse, stepchildren, parents), 180-day minor rule; one action for all heirs; personal representative for survival claim | "who can file a wrongful death lawsuit in California" |
| /wrongful-death/survival-action | Survival Actions | **Owns CCP §377.30/§377.34**: survival vs wrongful death, who brings it, what it recovers, pain-and-suffering rule (2022–2025 window), punitive damages | "survival action California" |
| /wrongful-death/statute-of-limitations | Wrongful Death Deadlines | **Owns deadlines**: §335.1 (2 yrs from death), §340.5 med mal, §911.2/§911.4/§945.6 government, §352 minors (and its government-claim exception), §364 | "wrongful death statute of limitations California" |

## Group: Vehicle Accidents  (group: "Vehicle Accidents"; parent /practice-areas)
| Slug | Name | Owns / focus | Search focus |
|---|---|---|---|
| /car-accident-lawyer | Car Accidents | **DONE — the example page.** Owns general crash steps, comparative fault, auto insurance minimums, Prop 213 | "car accident lawyer California" |
| /truck-accident-lawyer | Truck Accidents | Commercial trucks/big rigs; multiple defendants (driver, carrier, shipper/loader, maintenance, manufacturer); hours-of-service; §22406 55 mph; ELD data | "truck accident lawyer California" |
| /motorcycle-accident-lawyer | Motorcycle Accidents | Rider bias; §21658.1 lane splitting; §27803 helmet law and how it affects damages (comparative fault for head injuries only, generally) | "motorcycle accident lawyer California" |
| /rideshare-accident-lawyer | Rideshare (Uber & Lyft) Accidents | **Owns §5433** insurance periods; passengers, other drivers, pedestrians; app data evidence; drivers as independent contractors | "Uber accident lawyer California", "Lyft accident lawyer" |
| /pedestrian-accident-lawyer | Pedestrian Accidents | Right of way; §21955 Freedom to Walk Act; hit-and-run & UM coverage; dangerous crossings (government claims) | "pedestrian accident lawyer California" |
| /bicycle-accident-lawyer | Bicycle Accidents | §21760 three-foot rule; dooring; road hazards; bike lanes; UM coverage applies to cyclists | "bicycle accident lawyer California" |

## Group: Serious Injuries  (group: "Serious Injuries"; parent /practice-areas)
| Slug | Name | Owns / focus | Search focus |
|---|---|---|---|
| /catastrophic-injury-lawyer | Catastrophic Injuries | Hub: what makes an injury catastrophic; lifetime damages; life care plans; future earning capacity; links to brain, spinal, burn | "catastrophic injury lawyer California" |
| /brain-injury-lawyer | Brain Injuries (TBI) | Concussion to severe TBI; delayed/invisible symptoms; proving TBI (imaging, neuropsych testing); long-term care | "brain injury lawyer California" |
| /spinal-cord-injury-lawyer | Spinal Cord Injuries | Complete/incomplete injuries, paralysis; lifetime costs; home/vehicle modifications | "spinal cord injury lawyer California" |
| /burn-injury-lawyer | Burn Injuries | Degrees of burns; causes (vehicle fires, explosions, defective products, workplace, electrical, scalding); scarring/disfigurement damages | "burn injury lawyer California" |

## Group: Other Practice Areas  (group: "Other Practice Areas"; parent /practice-areas)
| Slug | Name | Owns / focus | Search focus |
|---|---|---|---|
| /medical-malpractice-lawyer | Medical Malpractice | **Owns MICRA for injury** ($470,000 in 2026, separate caps, economic not capped); §340.5; §364; types (misdiagnosis, surgical, birth injury, medication) | "medical malpractice lawyer California" |
| /nursing-home-abuse-lawyer | Nursing Home Abuse & Neglect | **Owns §15657** Elder Abuse Act; signs of neglect (bedsores, falls, dehydration, wandering); reporting | "nursing home abuse lawyer California" |
| /premises-liability-lawyer | Premises Liability & Slip and Fall | Owner's duty of reasonable care; slip and fall; negligent security; dangerous public property (§835, link to government claims) | "slip and fall lawyer California", "premises liability" |
| /dog-bite-lawyer | Dog Bites | **Owns §3342** strict liability; bites vs other dog injuries; homeowner's/renter's insurance; children | "dog bite lawyer California" |
| /product-liability-lawyer | Defective Products | Strict liability: manufacturing, design, warning defects; who can be liable in the chain; preserve the product; vehicle defects, recalls | "product liability lawyer California" |
| /workplace-injury-lawyer | Workplace Injuries | **Owns §3602** for the injured worker; third-party claims; construction sites; workers' comp runs alongside | "workplace injury lawyer California", "construction accident" |
| /government-claims-lawyer | Claims Against Government Entities | **Owns §911.2/§911.4/§945.6** process step by step; city bus/vehicle crashes; dangerous public property §835; minors' tolling doesn't apply (§352) | "claim against city California", "government claim deadline" |

## Linking rules
- Link the first mention of a topic owned by another page, e.g. `[who can file](/wrongful-death/who-can-file)`. 2–6 internal links per page; never link to the page itself.
- Wrongful death pages link back to the matching main page (and vice versa where one exists).
- `related`: 3–4 slugs from the table above, most relevant first.
