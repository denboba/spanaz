import founderImage from "@/assets/founder-portrait.jpg";
import oilsImage from "@/assets/oils-towels.jpg";
import treatmentImage from "@/assets/oils-towels.jpg";
import { useI18n } from "@/lib/i18n";

export function AboutBrand() {
  const { lang } = useI18n();
  const copy =
    lang === "ro"
      ? {
          eyebrow: "POVESTEA SPA NAZ",
          title: "Grijă personală, tehnică profesională și ospitalitate caldă.",
          lead:
            "SPA NAZ a fost creat pentru oamenii care vor să se relaxeze fără să transforme relaxarea într-o altă deplasare prin oraș.",
          body:
            "Fiecare programare este privată, calmă și atent pregătită. Accentul este pe confort, comunicare simplă și o experiență în care timpul tău rămâne cu adevărat al tău.",
          brand: "Feel the Naz Way",
          brandBody:
            "Mai puțină grabă. Mai multă grijă. O experiență care vine la tine.",
          founderAlt: "Fondatoarea SPA NAZ, profesionistă în masaj în București",
          signature: "Private care, brought home.",
        }
      : {
          eyebrow: "THE SPA NAZ STORY",
          title: "Personal care, professional technique and warm hospitality.",
          lead:
            "SPA NAZ was created for people who want to unwind without turning relaxation into another journey across the city.",
          body:
            "Every appointment is private, calm and thoughtfully prepared. The focus is comfort, simple communication and an experience where your time truly remains your own.",
          brand: "Feel the Naz Way",
          brandBody:
            "Less rushing. More care. A private experience that comes to you.",
          founderAlt: "SPA NAZ founder, massage professional in Bucharest",
          signature: "Private care, brought home.",
        };

  return (
    <section id="despre" className="scroll-mt-24 bg-sand/65 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-4 max-w-[12ch] text-4xl leading-[1.04] sm:text-5xl lg:text-[3.6rem]">
            {copy.title}
          </h2>
          <div className="gold-rule mt-7" />

          <p className="mt-7 max-w-xl text-lg leading-8 text-foreground/88">
            {copy.lead}
          </p>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            {copy.body}
          </p>

          <div className="mt-10 border-l border-gold/60 pl-6">
            <p className="eyebrow">{copy.brand}</p>
            <p className="mt-3 max-w-lg font-display text-3xl italic leading-tight text-foreground">
              “{copy.brandBody}”
            </p>
            <p className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {copy.signature}
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto max-w-xl">
            <div className="relative overflow-hidden rounded-[2.75rem] border border-white/50 bg-card p-2 shadow-lift">
              <img
                src={founderImage}
                alt={copy.founderAlt}
                width={1008}
                height={1264}
                loading="lazy"
                className="aspect-[4/5] w-full rounded-[2.35rem] object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-3 hidden w-44 overflow-hidden rounded-[1.5rem] border border-white/50 bg-card p-1.5 shadow-soft sm:block">
              <img
                src={oilsImage}
                alt=""
                width={1200}
                height={912}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-[1.2rem] object-cover"
              />
            </div>

            <div className="absolute -right-3 top-10 hidden w-36 overflow-hidden rounded-[1.35rem] border border-white/50 bg-card p-1.5 shadow-soft lg:block">
              <img
                src={treatmentImage}
                alt=""
                width={1200}
                height={912}
                loading="lazy"
                className="aspect-square w-full rounded-[1rem] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
