import { MessageCircle, CalendarCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whatsappLink } from "@/content/business";

export function StickyCta() {
  const { t, lang } = useI18n();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/92 px-3 py-2.5 shadow-[0_-18px_45px_-32px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-[1fr_auto] items-center gap-2.5 pb-[env(safe-area-inset-bottom)]">
        <a
          href="/#rezervare"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-primary-foreground shadow-soft"
        >
          <CalendarCheck className="h-4 w-4" />
          {t.cta.bookShort}
        </a>
        <a
          href={whatsappLink(lang)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-whatsapp/25 bg-card text-whatsapp shadow-soft"
          aria-label={t.cta.whatsappShort}
        >
          <MessageCircle className="h-4.5 w-4.5" />
        </a>
      </div>
    </div>
  );
}
