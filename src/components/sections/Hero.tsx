import { MessageCircle, MapPin, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-home-spa.jpg";
import { useI18n } from "@/lib/i18n";
import { whatsappLink } from "@/content/business";

export function Hero() {
  const { t, lang } = useI18n();
  const copy =
    lang === "ro"
      ? {
          eyebrow: "FEEL THE NAZ WAY",
          location: "Experiență spa privată la domiciliu în București",
          title: "Relaxarea vine la tine.",
          subtitle:
            "SPA NAZ transformă casa ta într-un spa privat — fără trafic, fără sală de așteptare și fără graba unei vizite la salon.",
          detail:
            "Tu alegi momentul. Noi aducem ritualul, atmosfera și experiența.",
          imageTagline: "Casa ta. Timpul tău.",
          privateLabel: "Programări private",
          professionalLabel: "Masaj profesional",
          preparedLabel: "Experiență complet pregătită",
        }
      : {
          eyebrow: "FEEL THE NAZ WAY",
          location: "Private home spa experience in Bucharest",
          title: "Relaxation comes to you.",
          subtitle:
            "SPA NAZ turns your home into a private spa — no traffic, no waiting room and no rushed salon visit.",
          detail:
            "You choose the moment. We bring the ritual, atmosphere and experience.",
          imageTagline: "Your home. Your time.",
          privateLabel: "Private appointments",
          professionalLabel: "Professional massage",
          preparedLabel: "Fully prepared experience",
        };

  return (
    <section className="relative isolate overflow-hidden border-b border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,var(--color-gold-soft),transparent_34%),radial-gradient(circle_at_85%_25%,var(--color-sand),transparent_38%)] opacity-70" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:pb-28 lg:pt-24">
        <div className="fade-up max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/70 px-4 py-2 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span className="eyebrow text-[0.64rem]">{copy.eyebrow}</span>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-gold" />
            {copy.location}
          </p>

          <h1 className="mt-5 max-w-[10ch] text-[3.25rem] leading-[0.96] tracking-[-0.035em] sm:text-[4.5rem] lg:text-[5.65rem]">
            {copy.title}
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {copy.subtitle}
          </p>
          <p className="mt-2 max-w-xl text-base leading-7 text-foreground/80">
            {copy.detail}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#rezervare"
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lift transition duration-300 hover:-translate-y-0.5 hover:opacity-95"
            >
              {t.cta.book}
            </a>
            <a
              href={whatsappLink(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-primary/25 bg-card/70 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur transition duration-300 hover:border-primary/50 hover:bg-card"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              {t.cta.whatsapp}
            </a>
          </div>

          <div className="mt-9 grid gap-3 border-t border-border/70 pt-6 text-xs uppercase tracking-[0.12em] text-muted-foreground sm:grid-cols-3">
            <span>{copy.privateLabel}</span>
            <span>{copy.professionalLabel}</span>
            <span>{copy.preparedLabel}</span>
          </div>
        </div>

        <div className="relative lg:pl-4">
          <div className="absolute -left-3 top-12 hidden h-28 w-px bg-gradient-to-b from-transparent via-gold to-transparent lg:block" />
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/40 bg-card p-2 shadow-lift">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.35rem]">
              <img
                src={heroImage}
                alt={t.hero.imageAlt}
                width={1600}
                height={1104}
                fetchPriority="high"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">SPA NAZ · BUCUREȘTI</p>
                <p className="mt-2 font-display text-3xl">{copy.imageTagline}</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-border/80 bg-background/90 px-5 py-4 shadow-soft backdrop-blur md:block">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">60 · 90 · 120 MIN</p>
            <p className="mt-1 font-display text-xl">Private spa, at home</p>
          </div>
        </div>
      </div>
    </section>
  );
}
