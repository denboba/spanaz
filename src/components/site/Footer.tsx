import { Facebook, Instagram, Music2, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { BUSINESS } from "@/content/business";

export function Footer() {
  const { t } = useI18n();

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/#despre", label: t.nav.about },
    { href: "/#servicii", label: t.nav.services },
    { href: "/#preturi", label: t.nav.prices },
    { href: "/#intrebari", label: t.nav.faq },
    { href: "/#rezervare", label: t.nav.book },
    { href: "/#contact", label: t.nav.contact },
  ];

  const socials = [
    { href: BUSINESS.social.instagram, label: "Instagram", Icon: Instagram },
    { href: BUSINESS.social.facebook, label: "Facebook", Icon: Facebook },
    { href: BUSINESS.social.tiktok, label: "TikTok", Icon: Music2 },
  ].filter((item) => item.href && item.href !== "#");

  return (
    <footer className="border-t border-border/60 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="font-display text-4xl tracking-[0.08em]">SPA NAZ</p>
            <p className="mt-1 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-background/50">
              Private home spa · Bucharest
            </p>
            <p className="mt-6 max-w-md text-sm leading-7 text-background/65">
              {t.footer.tagline}
            </p>

            <a
              href="/#rezervare"
              className="mt-7 inline-flex items-center gap-2 border-b border-background/30 pb-1 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-background transition hover:border-gold"
            >
              {t.nav.book}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <div className="mt-8 space-y-1.5 text-sm text-background/55">
              <p>
                {BUSINESS.city}, {BUSINESS.country}
              </p>
              <a
                href={`mailto:${BUSINESS.bookingEmail}`}
                className="inline-block transition hover:text-background"
              >
                {BUSINESS.bookingEmail}
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-background/45">
              {t.footer.linksTitle}
            </h3>
            <ul className="mt-5 space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-display text-xl text-background/78 transition hover:text-background"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {socials.length > 0 && (
              <>
                <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-background/45">
                  {t.footer.socialTitle}
                </h3>
                <div className="mt-5 flex gap-2.5">
                  {socials.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-background/15 text-background/75 transition hover:border-gold/60 hover:text-background"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </>
            )}

            <h3
              className={`${socials.length > 0 ? "mt-9" : ""} text-[0.68rem] font-bold uppercase tracking-[0.16em] text-background/45`}
            >
              {t.footer.legalTitle}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-background/60">
              <li>
                <Link to="/privacy" className="transition hover:text-background">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition hover:text-background">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link to="/cancellation" className="transition hover:text-background">
                  {t.footer.cancellation}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[0.68rem] uppercase tracking-[0.09em] text-background/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>{t.footer.rights}</span>
          <span>Feel the Naz Way</span>
        </div>
      </div>
    </footer>
  );
}
