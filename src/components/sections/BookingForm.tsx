import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SERVICES, SERVICE_AREAS, SESSION_OPTIONS, whatsappLink } from "@/content/business";
import { BookingConfigurationError, createBooking } from "@/lib/booking-store";
import { validateAndNormalizePhone } from "@/lib/phone";
import { getBookedSlots, slotIsAvailable } from "@/lib/availability-store";

type FieldName =
  | "name"
  | "phone"
  | "service"
  | "session"
  | "date"
  | "time"
  | "sector"
  | "address"
  | "privacy"
  | "terms";

type Errors = { [K in FieldName]?: string | undefined };

type SubmittedSummary = {
  service: string;
  session: string;
  date: string;
  time: string;
  sector: string;
};

type AvailabilityState = "idle" | "checking" | "available" | "unavailable" | "unknown";

const inputClass =
  "min-h-14 w-full rounded-[1rem] border border-input/90 bg-background/80 px-4 py-3.5 text-[0.95rem] text-foreground shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] outline-none transition duration-200 hover:border-primary/25 focus:border-gold/70 focus:bg-card focus:ring-4 focus:ring-gold/10 placeholder:text-muted-foreground/65";

function Field({
  id,
  label,
  children,
  error,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string | undefined;
  hint?: string | undefined;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[0.72rem] font-bold uppercase tracking-[0.09em] text-foreground/75"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-2 text-[0.72rem] leading-5 text-muted-foreground">{hint}</p>}
      {error && <p className="mt-2 text-[0.72rem] font-medium text-destructive">{error}</p>}
    </div>
  );
}

function localDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

export function BookingForm() {
  const { t, lang } = useI18n();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedSummary | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sessionKey, setSessionKey] = useState("restore");
  const [availability, setAvailability] = useState<AvailabilityState>("idle");
  const minDate = useMemo(localDateInputValue, []);
  const formStartedAt = useRef(Date.now());

  const selectedSession =
    SESSION_OPTIONS.find((item) => item.key === sessionKey) ?? SESSION_OPTIONS[0]!;

  const labels =
    lang === "ro"
      ? {
          session: "Sesiune",
          sector: "Sector",
          phone: "Telefon / WhatsApp",
          phoneHint: "Un singur număr mobil pe care te putem suna sau contacta pe WhatsApp.",
          phoneInvalid: "Introdu un număr mobil valid, de ex. 07xx xxx xxx sau +cod țară.",
          onlineError:
            "Rezervarea nu a putut fi trimisă acum. Încearcă din nou sau contactează SPA NAZ pe WhatsApp.",
          reference: "Referință rezervare",
          requested: "Cererea ta",
          pastDate: "Alege data de astăzi sau o dată viitoare",
          pendingNote:
            "Cererea a fost înregistrată. Intervalul rămâne definitiv numai după confirmarea SPA NAZ.",
          availabilityIdle: "Alege data și ora pentru a verifica intervalul.",
          availabilityChecking: "Verificăm programările confirmate…",
          availabilityAvailable: "Intervalul este liber în calendarul curent.",
          availabilityUnavailable: "Acest interval se suprapune cu o programare confirmată. Alege altă oră.",
          availabilityUnknown:
            "Nu am putut verifica disponibilitatea live. Poți trimite cererea, iar SPA NAZ va confirma manual.",
          privacy:
            "Am citit Politica de confidențialitate și înțeleg cum sunt folosite datele mele pentru gestionarea cererii.",
          terms:
            "Accept Termenii și Politica de anulare pentru această cerere de programare.",
          requiredLegal: "Confirmă această opțiune pentru a continua.",
        }
      : {
          session: "Session",
          sector: "Sector",
          phone: "Phone / WhatsApp",
          phoneHint: "One mobile number we can call or use to contact you on WhatsApp.",
          phoneInvalid: "Enter a valid mobile number, e.g. 07xx xxx xxx or +country code.",
          onlineError:
            "We couldn't send your booking request right now. Please try again or contact SPA NAZ on WhatsApp.",
          reference: "Booking reference",
          requested: "Your request",
          pastDate: "Choose today or a future date",
          pendingNote:
            "Your request is recorded. The time becomes final only after SPA NAZ confirms it.",
          availabilityIdle: "Choose a date and time to check the calendar.",
          availabilityChecking: "Checking confirmed appointments…",
          availabilityAvailable: "This time is currently open in the calendar.",
          availabilityUnavailable: "This time overlaps a confirmed appointment. Choose another time.",
          availabilityUnknown:
            "Live availability could not be checked. You can still send the request and SPA NAZ will confirm manually.",
          privacy:
            "I have read the Privacy Policy and understand how my data is used to manage this request.",
          terms:
            "I accept the Terms and Cancellation Policy for this appointment request.",
          requiredLegal: "Confirm this option to continue.",
        };

  useEffect(() => {
    let cancelled = false;

    if (!date || !time || !selectedSession) {
      setAvailability("idle");
      return;
    }

    setAvailability("checking");
    const timeout = window.setTimeout(() => {
      void getBookedSlots(date)
        .then((slots) => {
          if (cancelled) return;
          setAvailability(
            slotIsAvailable(slots, time, selectedSession.minutes) ? "available" : "unavailable",
          );
        })
        .catch(() => {
          if (!cancelled) setAvailability("unknown");
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [date, time, selectedSession]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const next: Errors = {};

    // Low-friction bot trap. Real users never see or interact with this field.
    if (String(form.get("website") ?? "").trim() || Date.now() - formStartedAt.current < 600) {
      setSubmitError(labels.onlineError);
      return;
    }

    const required: FieldName[] = [
      "name",
      "phone",
      "service",
      "session",
      "date",
      "time",
      "sector",
      "address",
    ];

    for (const field of required) {
      if (!String(form.get(field) ?? "").trim()) next[field] = t.booking.errors.required;
    }

    const phoneResult = validateAndNormalizePhone(phone);
    if (!phoneResult.valid) next.phone = labels.phoneInvalid;
    if (date && date < minDate) next.date = labels.pastDate;
    if (availability === "unavailable") next.time = labels.availabilityUnavailable;
    if (!form.get("privacy")) next.privacy = labels.requiredLegal;
    if (!form.get("terms")) next.terms = labels.requiredLegal;

    const serviceKey = String(form.get("service") ?? "");
    const service = SERVICES.find((item) => item.key === serviceKey);
    const session = SESSION_OPTIONS.find((item) => item.key === sessionKey);

    if (!service) next.service = t.booking.errors.required;
    if (!session) next.session = t.booking.errors.required;

    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length > 0 || !service || !session || !phoneResult.valid) return;

    const summary: SubmittedSummary = {
      service: service.name[lang],
      session:
        session.name +
        " · " +
        session.minutes +
        " min · " +
        session.priceLei +
        " lei",
      date,
      time,
      sector: String(form.get("sector") ?? ""),
    };

    setSubmitting(true);
    try {
      const result = await createBooking({
        name: String(form.get("name") ?? "").trim(),
        phone: phoneResult.normalized,
        serviceKey: service.key,
        serviceName: service.name[lang],
        sessionKey: session.key,
        sessionName: session.name,
        durationMinutes: session.minutes,
        priceLei: session.priceLei,
        date,
        time,
        sector: summary.sector,
        address: String(form.get("address") ?? "").trim(),
        people: Number(form.get("people") ?? 1),
        message: String(form.get("message") ?? "").trim().slice(0, 1000),
        language: lang,
      });

      setBookingReference(result.reference);
      setSubmittedSummary(summary);
      setSent(true);
      formElement.reset();
      setPhone("");
      setDate("");
      setTime("");
      setSessionKey("restore");
      setAvailability("idle");
    } catch (error) {
      console.error("Booking submission failed", error);
      setSubmitError(labels.onlineError);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="surface-card mx-auto max-w-xl p-8 text-center fade-up">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
        <h3 className="mt-4 text-2xl">{t.booking.successTitle}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t.booking.successBody}
        </p>

        {bookingReference && (
          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {labels.reference}
            </p>
            <p className="mt-1 font-display text-2xl">{bookingReference}</p>
          </div>
        )}

        {submittedSummary && (
          <div className="mt-4 rounded-xl border border-border bg-background p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {labels.requested}
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t.booking.fields.service}</dt>
                <dd className="text-right font-medium">{submittedSummary.service}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{labels.session}</dt>
                <dd className="text-right font-medium">{submittedSummary.session}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t.booking.fields.date}</dt>
                <dd className="text-right font-medium">
                  {submittedSummary.date} · {submittedSummary.time}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{labels.sector}</dt>
                <dd className="text-right font-medium">{submittedSummary.sector}</dd>
              </div>
            </dl>
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {labels.pendingNote}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={whatsappLink(lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-medium text-whatsapp-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {t.booking.whatsappCta}
          </a>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setBookingReference("");
              setSubmittedSummary(null);
            }}
            className="rounded-full border border-primary px-6 py-3.5 text-sm font-medium text-primary"
          >
            {t.booking.successAgain}
          </button>
        </div>
      </div>
    );
  }

  const availabilityText =
    availability === "checking"
      ? labels.availabilityChecking
      : availability === "available"
        ? labels.availabilityAvailable
        : availability === "unavailable"
          ? labels.availabilityUnavailable
          : availability === "unknown"
            ? labels.availabilityUnknown
            : labels.availabilityIdle;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative mx-auto w-full overflow-hidden rounded-[2.25rem] border border-border/80 bg-card/95 p-5 shadow-lift sm:p-8 lg:p-9"
    >
      <div className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="mb-7 rounded-[1.25rem] border border-gold/20 bg-gold-soft/35 p-4 sm:p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-clay" />
          <p className="text-[0.82rem] leading-6 text-muted-foreground">
            {lang === "ro"
              ? "Cerem doar datele necesare pentru programare. Nu folosim datele de rezervare pentru marketing fără o opțiune separată."
              : "We ask only for information needed to manage your appointment. Booking data is not used for marketing without a separate opt-in."}
          </p>
        </div>
      </div>

      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
        <Field id="name" label={t.booking.fields.name} error={errors.name}>
          <input id="name" name="name" autoComplete="name" className={inputClass} />
        </Field>

        <Field
          id="phone"
          label={labels.phone}
          error={errors.phone}
          hint={labels.phoneHint}
        >
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }));
            }}
            onBlur={() => {
              if (!phone.trim()) return;
              const result = validateAndNormalizePhone(phone);
              if (!result.valid) {
                setErrors((current) => ({ ...current, phone: labels.phoneInvalid }));
              }
            }}
            placeholder={lang === "ro" ? "07xx xxx xxx" : "+40 7xx xxx xxx"}
            className={inputClass}
          />
        </Field>

        <Field id="service" label={t.booking.fields.service} error={errors.service}>
          <select id="service" name="service" defaultValue="" className={inputClass}>
            <option value="" disabled>
              {t.booking.select}
            </option>
            {SERVICES.map((service) => (
              <option key={service.key} value={service.key}>
                {service.name[lang]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="session" label={labels.session} error={errors.session}>
          <select
            id="session"
            name="session"
            value={sessionKey}
            onChange={(event) => setSessionKey(event.target.value)}
            className={inputClass}
          >
            {SESSION_OPTIONS.map((session) => (
              <option key={session.key} value={session.key}>
                {session.featured ? "★ " : ""}
                {session.name} · {session.minutes} min · {session.priceLei} lei
              </option>
            ))}
          </select>
        </Field>

        <Field id="people" label={t.booking.fields.people}>
          <select id="people" name="people" defaultValue="1" className={inputClass}>
            {[1, 2, 3, 4].map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </Field>

        <Field id="sector" label={labels.sector} error={errors.sector}>
          <select id="sector" name="sector" defaultValue="" className={inputClass}>
            <option value="" disabled>
              {t.booking.select}
            </option>
            {SERVICE_AREAS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </Field>

        <Field id="date" label={t.booking.fields.date} error={errors.date}>
          <input
            id="date"
            name="date"
            type="date"
            min={minDate}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id="time" label={t.booking.fields.time} error={errors.time}>
          <input
            id="time"
            name="time"
            type="time"
            step={1800}
            value={time}
            onChange={(event) => {
              setTime(event.target.value);
              if (errors.time) setErrors((current) => ({ ...current, time: undefined }));
            }}
            className={inputClass}
          />
        </Field>

        <div className="sm:col-span-2">
          <div
            className={
              "flex min-h-12 items-start gap-2.5 rounded-[1rem] border px-4 py-3 text-[0.8rem] leading-5 " +
              (availability === "available"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : availability === "unavailable"
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : "border-border bg-background text-muted-foreground")
            }
          >
            {availability === "checking" ? (
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
            ) : availability === "available" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{availabilityText}</span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Field id="address" label={t.booking.fields.address} error={errors.address}>
            <input
              id="address"
              name="address"
              autoComplete="street-address"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field id="message" label={t.booking.fields.message}>
            <textarea
              id="message"
              name="message"
              rows={4}
              maxLength={1000}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className="mt-7 space-y-4 rounded-[1.25rem] border border-border/70 bg-background/60 p-4 sm:p-5">
        <label htmlFor="privacy" className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            id="privacy"
            name="privacy"
            type="checkbox"
            className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-input accent-[var(--primary)]"
          />
          <span>
            {labels.privacy}{" "}
            <a href="/privacy" target="_blank" className="font-medium text-primary underline-offset-2 hover:underline">
              {lang === "ro" ? "Politica de confidențialitate" : "Privacy Policy"}
            </a>
          </span>
        </label>
        {errors.privacy && <p className="text-xs text-destructive">{errors.privacy}</p>}

        <label htmlFor="terms" className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-input accent-[var(--primary)]"
          />
          <span>
            {labels.terms}{" "}
            <a href="/terms" target="_blank" className="font-medium text-primary underline-offset-2 hover:underline">
              {lang === "ro" ? "Termeni" : "Terms"}
            </a>
            {" · "}
            <a href="/cancellation" target="_blank" className="font-medium text-primary underline-offset-2 hover:underline">
              {lang === "ro" ? "Anulare" : "Cancellation"}
            </a>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
      </div>

      {submitError && (
        <div
          className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || availability === "unavailable" || availability === "checking"}
        className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-[0.78rem] font-bold uppercase tracking-[0.07em] text-primary-foreground shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {t.booking.submit}
      </button>

      <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {t.booking.or}
      </p>

      <a
        href={whatsappLink(lang)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-whatsapp/25 bg-background px-6 py-4 text-[0.78rem] font-bold uppercase tracking-[0.06em] text-whatsapp transition hover:bg-whatsapp/5"
      >
        <MessageCircle className="h-4 w-4" />
        {t.booking.whatsappCta}
      </a>
    </form>
  );
}
