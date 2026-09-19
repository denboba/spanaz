import { MapPin } from "lucide-react";
import { SERVICE_AREAS } from "@/content/business";
import { useI18n } from "@/lib/i18n";

export function Coverage() {
  const { lang } = useI18n();
  const copy =
    lang === "ro"
      ? {
          title: "Masaj la domiciliu în București",
          body: "SPA NAZ oferă programări la domiciliu în Sectoarele 1, 4 și 6. Introdu adresa completă la rezervare, iar noi confirmăm disponibilitatea pentru data și ora alese.",
          label: "Zone deservite",
          note: "Programările sunt confirmate în funcție de disponibilitate și timpul de deplasare.",
          mapAlt: "Hartă a Bucureștiului pentru zonele deservite de SPA NAZ",
        }
      : {
          title: "Home massage in Bucharest",
          body: "SPA NAZ provides home massage appointments in Sectors 1, 4 and 6. Enter your full address when booking and we will confirm availability for your selected date and time.",
          label: "Service areas",
          note: "Appointments are confirmed based on availability and travel time.",
          mapAlt: "Map of Bucharest showing the SPA NAZ service area",
        };

  return (
    <section id="zone" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <MapPin className="h-6 w-6 text-gold" />
          <h2 className="mt-4 text-3xl sm:text-4xl">{copy.title}</h2>
          <div className="gold-rule mt-5 bg-gold" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">{copy.body}</p>
          <p className="eyebrow mt-8">{copy.label}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SERVICE_AREAS.map((area) => (
              <li key={area} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
                {area}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">{copy.note}</p>
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-border shadow-soft">
          <iframe
            title={copy.mapAlt}
            src="https://www.openstreetmap.org/export/embed.html?bbox=25.95%2C44.33%2C26.25%2C44.55&layer=mapnik"
            className="h-[320px] w-full sm:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
