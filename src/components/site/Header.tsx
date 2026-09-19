import { Link } from "@tanstack/react-router";
import { Menu, X, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useI18n } from "@/lib/i18n";
import { whatsappLink } from "@/content/business";
import { subscribeToCustomerAuth } from "@/lib/customer-auth";

const OWNER_ADMIN_EMAIL = "homespanaz@gmail.com";

const sections = [
  { id: "despre", key: "about" },
  { id: "servicii", key: "services" },
  { id: "preturi", key: "prices" },
  { id: "intrebari", key: "faq" },
  { id: "contact", key: "contact" },
] as const;

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    void subscribeToCustomerAuth((nextUser) => {
      if (active) setUser(nextUser);
    })
      .then((cleanup) => {
        if (active) unsubscribe = cleanup;
        else cleanup();
      })
      .catch(() => undefined);

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const isOwner =
    user?.email?.trim().toLowerCase() === OWNER_ADMIN_EMAIL && user.emailVerified;
  const accountHref = user ? "/account" : "/#account";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto grid min-h-[4.75rem] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[auto_1fr_auto]">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/35 bg-card font-display text-lg italic text-primary shadow-soft">
            N
          </span>
          <span className="min-w-0">
            <span className="block font-display text-[1.35rem] leading-none tracking-[0.12em] text-foreground">
              SPA NAZ
            </span>
            <span className="mt-1 hidden text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Private home spa
            </span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`/#${s.id}`}
              className="relative py-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform hover:text-foreground hover:after:scale-x-100"
            >
              {t.nav[s.key]}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center rounded-full border border-border/80 bg-card/80 p-1 shadow-soft sm:flex">
            {(["ro", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`min-w-9 rounded-full px-2.5 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.1em] transition ${
                  lang === l
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {isOwner && (
            <Link
              to="/admin/bookings"
              className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-card px-3.5 py-2.5 text-xs font-semibold text-primary transition hover:border-primary/40 md:inline-flex"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          <a
            href="/#rezervare"
            className="hidden rounded-full bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-primary-foreground shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:inline-flex"
          >
            {t.cta.bookShort}
          </a>

          <a
            href={accountHref}
            aria-label={user ? "My account" : "Log in or create account"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/80 text-foreground shadow-soft transition hover:border-gold/50 hover:text-primary"
          >
            <UserRound className="h-4.5 w-4.5" />
          </a>

          <button
            type="button"
            aria-label="Meniu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/80 text-foreground shadow-soft lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/98 lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow">{lang === "ro" ? "Navigare" : "Navigation"}</p>
              <div className="flex items-center rounded-full border border-border bg-card p-1">
                {(["ro", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`rounded-full px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.1em] ${
                      lang === l
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <a
              href={accountHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-border/60 py-4 text-base font-semibold text-foreground"
            >
              <span className="flex items-center gap-3">
                <UserRound className="h-4 w-4 text-primary" />
                {user
                  ? lang === "ro"
                    ? "Contul meu"
                    : "My account"
                  : lang === "ro"
                    ? "Autentificare / Cont"
                    : "Login / Account"}
              </span>
            </a>

            {isOwner && (
              <Link
                to="/admin/bookings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-border/60 py-4 text-base font-semibold text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                {lang === "ro" ? "Panou administrare" : "Admin dashboard"}
              </Link>
            )}

            {sections.map((s) => (
              <a
                key={s.id}
                href={`/#${s.id}`}
                onClick={() => setOpen(false)}
                className="block border-b border-border/60 py-4 font-display text-2xl text-foreground"
              >
                {t.nav[s.key]}
              </a>
            ))}

            <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
              <a
                href="/#rezervare"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground"
              >
                {t.cta.bookShort}
              </a>
              <a
                href={whatsappLink(lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary"
                aria-label={t.cta.whatsapp}
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
