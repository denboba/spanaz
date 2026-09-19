import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Clock3, ShieldCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyCta } from "@/components/site/StickyCta";
import { FloatingChat } from "@/components/site/FloatingChat";
import { Hero } from "@/components/sections/Hero";
import { TrustBar, WhyUs, HowItWorks, Contact } from "@/components/sections/Sections";
import { Offerings, PricingAndMembership } from "@/components/sections/Offerings";
import { HomeSpaExperience } from "@/components/sections/HomeSpaExperience";
import { AboutBrand } from "@/components/sections/AboutBrand";
import { Coverage } from "@/components/sections/Coverage";
import { SpaFaq } from "@/components/sections/SpaFaq";
import { BookingForm } from "@/components/sections/BookingForm";
import { CustomerAuth } from "@/components/site/CustomerAuth";
import { useI18n } from "@/lib/i18n";
import { BUSINESS, SERVICE_AREAS } from "@/content/business";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: "SPA NAZ",
  description:
    "SPA NAZ oferă masaje profesionale la domiciliu în București, inclusiv relaxare, deep tissue, drenaj limfatic, aromaterapie, anticelulitic, bambus, masaj facial și pentru picioare.",
  areaServed: SERVICE_AREAS.map((name) => ({ "@type": "AdministrativeArea", name })),
  address: { "@type": "PostalAddress", addressLocality: "București", addressCountry: "RO" },
  telephone: BUSINESS.phoneHref,
  email: BUSINESS.email,
  priceRange: "200-340 RON",
  availableLanguage: ["ro", "en"],
  url: "https://spanaz.ro/",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPA NAZ | Masaj la Domiciliu în București" },
      {
        name: "description",
        content:
          "SPA NAZ oferă masaj profesional la domiciliu în Sectoarele 1, 4 și 6 din București. Relaxare, deep tissue, drenaj limfatic și aromaterapie.",
      },
      { property: "og:title", content: "SPA NAZ | Masaj la Domiciliu în București" },
      {
        property: "og:description",
        content:
          "Masaj profesional la domiciliu în București: relaxare, deep tissue, drenaj limfatic și aromaterapie. Rezervă online sau pe WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://spanaz.ro/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://spanaz.ro/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(localBusinessSchema) }],
  }),
  component: Index,
});

function BookingSection() {
  const { t, lang } = useI18n();
  const copy =
    lang === "ro"
      ? {
          eyebrow: "PROGRAMARE PRIVATĂ",
          note: "Cererea este verificată înainte de confirmare.",
          availability: "Disponibilitate verificată înainte de confirmare",
          privacy: "Date folosite numai pentru gestionarea programării",
          response: "Confirmare directă de la SPA NAZ",
        }
      : {
          eyebrow: "PRIVATE APPOINTMENT",
          note: "Every request is checked before it is confirmed.",
          availability: "Availability checked before confirmation",
          privacy: "Data used only to manage your appointment",
          response: "Direct confirmation from SPA NAZ",
        };

  const assurances = [
    { Icon: CalendarCheck, text: copy.availability },
    { Icon: ShieldCheck, text: copy.privacy },
    { Icon: Clock3, text: copy.response },
  ];

  return (
    <section
      id="rezervare"
      className="relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-sand/60 py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-gold-soft/70 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.38fr_0.62fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-4 max-w-[12ch] text-4xl leading-tight sm:text-5xl">
            {t.booking.title}
          </h2>
          <div className="gold-rule mt-6" />
          <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
            {t.booking.subtitle}
          </p>

          <div className="mt-8 space-y-4 border-t border-border/70 pt-6">
            {assurances.map(({ Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-soft">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="pt-2 text-sm leading-5 text-foreground/80">{text}</p>
              </div>
            ))}
          </div>

          <p className="mt-7 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {copy.note}
          </p>
        </div>

        <div>
          <BookingForm />
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <HomeSpaExperience />
        <Offerings />
        <WhyUs />
        <HowItWorks />
        <AboutBrand />
        <PricingAndMembership />
        <Coverage />
        <SpaFaq />
        <CustomerAuth />
        <BookingSection />
        <Contact />
      </main>
      <Footer />
      <FloatingChat />
      <StickyCta />
    </div>
  );
}
