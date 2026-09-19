import { Car, Home, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function HomeSpaExperience() {
  const { lang } = useI18n();
  const copy =
    lang === "ro"
      ? {
          eyebrow: "CE ÎNSEAMNĂ HOME SPA",
          title: "Spa-ul vine la tine. Tu rămâi în ritmul tău.",
          body:
            "Fără trafic, fără recepție, fără graba de după masaj. SPA NAZ pregătește experiența în spațiul în care te simți deja cel mai confortabil.",
          items: [
            {
              title: "Fără drumuri",
              desc: "Programarea începe acasă, nu în trafic.",
            },
            {
              title: "Spațiul tău",
              desc: "Intimitate, confort și ritmul pe care îl alegi tu.",
            },
            {
              title: "Experiență pregătită",
              desc: "Venim cu ceea ce este necesar pentru sesiunea aleasă.",
            },
          ],
        }
      : {
          eyebrow: "WHAT HOME SPA MEANS",
          title: "The spa comes to you. You stay in your own rhythm.",
          body:
            "No traffic, no reception desk, no rush after the massage. SPA NAZ prepares the experience in the place where you already feel most comfortable.",
          items: [
            {
              title: "No travel",
              desc: "Your appointment starts at home, not in traffic.",
            },
            {
              title: "Your space",
              desc: "Privacy, comfort and a pace that is entirely yours.",
            },
            {
              title: "Prepared experience",
              desc: "We arrive with what is needed for your selected session.",
            },
          ],
        };

  const icons = [Car, Home, Sparkles];

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-4 max-w-[12ch] text-4xl leading-[1.05] sm:text-5xl">
            {copy.title}
          </h2>
          <div className="gold-rule mt-7" />
          <p className="mt-7 max-w-lg text-base leading-8 text-muted-foreground">
            {copy.body}
          </p>
        </div>

        <div className="divide-y divide-border/70 border-y border-border/70">
          {copy.items.map((item, index) => {
            const Icon = icons[index] ?? Sparkles;
            return (
              <div
                key={item.title}
                className="group grid grid-cols-[auto_1fr] gap-5 py-7 sm:grid-cols-[auto_0.7fr_1fr] sm:items-center sm:gap-8"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-gold-soft/45 text-clay">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="text-2xl sm:text-3xl">{item.title}</h3>
                <p className="col-start-2 text-sm leading-6 text-muted-foreground sm:col-start-auto">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
