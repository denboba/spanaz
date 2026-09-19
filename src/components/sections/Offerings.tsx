import { ArrowUpRight, Check, Leaf, Star } from "lucide-react";
import { MEMBERSHIPS, SERVICES, SESSION_OPTIONS } from "@/content/business";
import { useI18n } from "@/lib/i18n";

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow">SPA NAZ COLLECTION</p>
      <h2 className="mt-3 text-4xl leading-tight sm:text-5xl">{title}</h2>
      <div className="gold-rule mx-auto mt-6 w-20 bg-gold" />
      {subtitle && (
        <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Offerings() {
  const { lang } = useI18n();
  const copy =
    lang === "ro"
      ? {
          title: "Alege ritualul potrivit pentru tine",
          subtitle:
            "Alegi mai întâi tipul de masaj, apoi durata. Fiecare experiență este pregătită pentru o programare privată, în confortul casei tale.",
          book: "Alege acest tratament",
          durations: "60 · 90 · 120 min",
        }
      : {
          title: "Choose the ritual that suits you",
          subtitle:
            "Choose the massage style first, then the duration. Every treatment is prepared as a private experience in the comfort of your home.",
          book: "Choose this treatment",
          durations: "60 · 90 · 120 min",
        };

  return (
    <section id="servicii" className="scroll-mt-24 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading title={copy.title} subtitle={copy.subtitle} />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <article
              key={service.key}
              className="group relative flex min-h-[21rem] flex-col overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-7 transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift sm:px-7"
            >
              <div className="absolute right-6 top-5 font-display text-5xl text-gold/20">
                {String(index + 1).padStart(2, "0")}
              </div>

              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-clay">
                <Leaf className="h-4.5 w-4.5" />
              </span>

              <h3 className="mt-7 max-w-[13ch] text-3xl leading-none">
                {service.name[lang]}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">
                {service.description[lang]}
              </p>

              <div className="mt-7 flex items-center justify-between border-t border-border/70 pt-5">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {copy.durations}
                </span>
                <a
                  href="#rezervare"
                  aria-label={copy.book + ": " + service.name[lang]}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingAndMembership() {
  const { lang } = useI18n();
  const copy =
    lang === "ro"
      ? {
          title: "Experiența de Relaxare",
          subtitle:
            "Trei durate simple. Alegi cât timp vrei să te oprești din ritmul zilei.",
          popular: "Recomandat",
          session: "experiență",
          membershipTitle: "SPA NAZ Membership",
          membershipSubtitle:
            "Pentru clienții care vor ca relaxarea să devină parte din rutină.",
          chooseDuration: "Alege durata",
          sessions: "experiențe",
          save: "Economie",
          book: "Rezervă experiența",
          sessionDescriptions: {
            relax: "Un reset complet de 60 de minute.",
            restore: "Mai mult timp pentru relaxare — experiența noastră recomandată.",
            signature: "Cea mai completă și imersivă experiență SPA NAZ.",
          },
        }
      : {
          title: "The Relaxation Experience",
          subtitle:
            "Three simple durations. Choose how long you want to step away from the pace of the day.",
          popular: "Recommended",
          session: "experience",
          membershipTitle: "SPA NAZ Membership",
          membershipSubtitle:
            "For clients who want relaxation to become part of their routine.",
          chooseDuration: "Choose duration",
          sessions: "experiences",
          save: "Save",
          book: "Book the experience",
          sessionDescriptions: {
            relax: "A complete 60-minute reset.",
            restore: "More time to unwind — our recommended experience.",
            signature: "Our most immersive SPA NAZ experience.",
          },
        };

  const standardPrice = (minutes: number) =>
    SESSION_OPTIONS.find((item) => item.minutes === minutes)?.priceLei ?? 0;
  const membershipGroups = [5, 10] as const;

  return (
    <section id="preturi" className="scroll-mt-24 bg-sand/70 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading title={copy.title} subtitle={copy.subtitle} />

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
          {SESSION_OPTIONS.map((session) => (
            <article
              key={session.key}
              className={
                "relative flex flex-col rounded-[2rem] border bg-card p-7 transition duration-300 " +
                (session.featured
                  ? "border-gold/60 shadow-lift md:-translate-y-3"
                  : "border-border/80 shadow-soft")
              }
            >
              {session.featured && (
                <div className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-clay">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {copy.popular}
                </div>
              )}
              <p className="eyebrow">{session.minutes} MIN</p>
              <h3 className="mt-2 text-4xl">{session.name}</h3>
              <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
                {copy.sessionDescriptions[session.key]}
              </p>
              <p className="mt-8 font-display text-5xl leading-none text-foreground">
                {session.priceLei}
                <span className="ml-2 text-lg text-muted-foreground">lei</span>
              </p>
              <a
                href="#rezervare"
                className={
                  "mt-8 inline-flex items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold transition " +
                  (session.featured
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground")
                }
              >
                {copy.book}
              </a>
            </article>
          ))}
        </div>

        <div className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">RETURN TO THE RITUAL</p>
            <h3 className="mt-3 text-4xl">{copy.membershipTitle}</h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {copy.membershipSubtitle}
            </p>
          </div>

          <div className="mx-auto mt-9 grid max-w-4xl gap-5 md:grid-cols-2">
            {membershipGroups.map((sessionCount) => {
              const options = MEMBERSHIPS.filter(
                (membership) => membership.sessions === sessionCount,
              );
              return (
                <article
                  key={sessionCount}
                  className="rounded-[2rem] border border-border/80 bg-card p-7 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">{sessionCount} EXPERIENCE MEMBERSHIP</p>
                      <h4 className="mt-2 text-3xl">{copy.chooseDuration}</h4>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-clay">
                      <Check className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-7 divide-y divide-border/70 border-y border-border/70">
                    {options.map((membership) => {
                      const regular =
                        standardPrice(membership.minutes) * membership.sessions;
                      const saving = regular - membership.priceLei;
                      return (
                        <div
                          key={membership.minutes}
                          className="flex items-center justify-between gap-4 py-4"
                        >
                          <div>
                            <p className="font-medium">{membership.minutes} min</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {membership.sessions} {copy.sessions}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-2xl">
                              {membership.priceLei}{" "}
                              <span className="text-base">lei</span>
                            </p>
                            {saving > 0 && (
                              <p className="mt-1 text-xs font-medium text-primary">
                                {copy.save}: {saving} lei
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
