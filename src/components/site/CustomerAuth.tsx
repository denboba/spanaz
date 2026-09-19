import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { User } from "firebase/auth";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  customerAuthError,
  loginCustomer,
  loginCustomerWithGoogle,
  logoutCustomer,
  registerCustomer,
  resendCustomerVerification,
  resetCustomerPassword,
  subscribeToCustomerAuth,
} from "@/lib/customer-auth";
import { useI18n } from "@/lib/i18n";

const OWNER_ADMIN_EMAIL = "homespanaz@gmail.com";

function hasAdminPermission(user: User) {
  return user.email?.trim().toLowerCase() === OWNER_ADMIN_EMAIL && user.emailVerified;
}

export function CustomerAuth() {
  const { lang } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const copy =
    lang === "ro"
      ? {
          eyebrow: "CONT SPA NAZ",
          title: "Programările tale, într-un singur loc",
          subtitle:
            "Creează un cont pentru a urmări statusul rezervărilor, a vedea programările confirmate și a anula direct atunci când este nevoie.",
          benefit1: "Vezi toate rezervările asociate contului",
          benefit2: "Primești un status clar: în așteptare, confirmat, finalizat",
          benefit3: "Poți anula rapid o programare eligibilă",
          login: "Autentificare",
          register: "Creează cont",
          email: "Adresă de email",
          password: "Parolă",
          forgot: "Ai uitat parola?",
          wait: "Se procesează…",
          google: "Continuă cu Google",
          or: "sau",
          created: "Cont creat. Verifică emailul pentru linkul de confirmare.",
          reset: "Emailul pentru resetarea parolei a fost trimis.",
          welcome: "Bine ai revenit",
          verified: "Email verificat",
          notVerified: "Emailul nu este verificat încă",
          resend: "Retrimite emailul de verificare",
          sent: "Email de verificare trimis.",
          bookings: "Rezervările mele",
          admin: "Panou administrare",
          signout: "Deconectare",
          privacyLead: "Prin crearea contului accepți",
          terms: "Termenii SPA NAZ",
          privacy: "Politica de confidențialitate",
        }
      : {
          eyebrow: "SPA NAZ ACCOUNT",
          title: "Your appointments, in one place",
          subtitle:
            "Create an account to track booking status, see confirmed appointments and cancel eligible requests directly.",
          benefit1: "Keep account-linked bookings together",
          benefit2: "See clear pending, confirmed and completed status",
          benefit3: "Cancel an eligible appointment quickly",
          login: "Log in",
          register: "Create account",
          email: "Email address",
          password: "Password",
          forgot: "Forgot password?",
          wait: "Please wait…",
          google: "Continue with Google",
          or: "or",
          created: "Account created. Check your email for the verification link.",
          reset: "Password reset email sent.",
          welcome: "Welcome back",
          verified: "Email verified",
          notVerified: "Email not verified yet",
          resend: "Resend verification email",
          sent: "Verification email sent.",
          bookings: "My bookings",
          admin: "Admin dashboard",
          signout: "Sign out",
          privacyLead: "By creating an account, you agree to the",
          terms: "SPA NAZ terms",
          privacy: "privacy policy",
        };

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
      .catch((authError) => {
        if (active) setError(customerAuthError(authError));
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const submit = async () => {
    if (submitting) return;
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (mode === "register") {
        await registerCustomer(email, password);
        setNotice(copy.created);
      } else {
        await loginCustomer(email, password);
      }
      setPassword("");
    } catch (authError) {
      setError(customerAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  };

  const googleSignIn = async () => {
    if (submitting) return;
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await loginCustomerWithGoogle();
    } catch (authError) {
      setError(customerAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  };

  const forgotPassword = async () => {
    setError("");
    setNotice("");
    try {
      await resetCustomerPassword(email);
      setNotice(copy.reset);
    } catch (authError) {
      setError(customerAuthError(authError));
    }
  };

  if (user) {
    const initial = (user.email?.[0] ?? "S").toUpperCase();
    return (
      <section id="account" className="scroll-mt-24 bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2.25rem] border border-border/80 bg-card shadow-lift">
            <div className="border-b border-border/70 bg-sand/55 p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-2xl text-primary-foreground">
                    {initial}
                  </div>
                  <div>
                    <p className="eyebrow">{copy.eyebrow}</p>
                    <h2 className="mt-1 text-2xl">{copy.welcome}</h2>
                    <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void logoutCustomer()}
                  className="inline-flex items-center justify-center rounded-full border border-border/80 bg-background px-5 py-3 text-[0.76rem] font-bold uppercase tracking-[0.06em] text-foreground transition hover:border-primary/30"
                >
                  {copy.signout}
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm">
                {user.emailVerified ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    <span>{copy.verified}</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole className="h-4 w-4 text-amber-700" />
                    <span>{copy.notVerified}</span>
                  </>
                )}
              </div>

              {!user.emailVerified && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setNotice("");
                    void resendCustomerVerification()
                      .then(() => setNotice(copy.sent))
                      .catch((authError) => setError(customerAuthError(authError)));
                  }}
                  className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {copy.resend}
                </button>
              )}

              {notice && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  {notice}
                </div>
              )}
              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/account"
                  className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-[0.76rem] font-bold uppercase tracking-[0.06em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
                >
                  <UserRound className="h-4 w-4" />
                  {copy.bookings}
                </Link>
                {hasAdminPermission(user) && (
                  <Link
                    to="/admin/bookings"
                    className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-full border border-primary/25 px-5 py-3.5 text-[0.76rem] font-bold uppercase tracking-[0.06em] text-primary transition hover:border-primary/50"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {copy.admin}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="account" className="scroll-mt-24 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2.5rem] border border-border/80 bg-card shadow-lift">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative overflow-hidden bg-sand/70 p-7 sm:p-10 lg:p-14">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-2xl" />
              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-clay">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="eyebrow mt-6">{copy.eyebrow}</p>
                <h2 className="mt-4 max-w-md text-4xl leading-[1.05] sm:text-5xl">{copy.title}</h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                  {copy.subtitle}
                </p>

                <div className="mt-8 space-y-4">
                  {[copy.benefit1, copy.benefit2, copy.benefit3].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm leading-relaxed text-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8 lg:p-14">
              <div className="mx-auto max-w-md">
                <div className="grid grid-cols-2 rounded-full border border-border/70 bg-muted/70 p-1">
                  {(["login", "register"] as const).map((nextMode) => (
                    <button
                      key={nextMode}
                      type="button"
                      onClick={() => {
                        setMode(nextMode);
                        setError("");
                        setNotice("");
                      }}
                      className={
                        "rounded-full px-4 py-2.5 text-[0.74rem] font-bold uppercase tracking-[0.06em] transition " +
                        (mode === nextMode
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground")
                      }
                    >
                      {nextMode === "login" ? copy.login : copy.register}
                    </button>
                  ))}
                </div>

                <form
                  className="mt-7 space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submit();
                  }}
                >
                  <div>
                    <label htmlFor="account-email" className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.09em] text-foreground/75">
                      {copy.email}
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="account-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="min-h-14 w-full rounded-[1rem] border border-input/90 bg-background/80 py-3.5 pl-11 pr-4 text-[0.95rem] outline-none transition hover:border-primary/25 focus:border-gold/70 focus:bg-card focus:ring-4 focus:ring-gold/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="account-password" className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.09em] text-foreground/75">
                      {copy.password}
                    </label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="account-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="min-h-14 w-full rounded-[1rem] border border-input/90 bg-background/80 py-3.5 pl-11 pr-12 text-[0.95rem] outline-none transition hover:border-primary/25 focus:border-gold/70 focus:bg-card focus:ring-4 focus:ring-gold/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  {notice && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                      {notice}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-[0.76rem] font-bold uppercase tracking-[0.07em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? copy.wait : mode === "login" ? copy.login : copy.register}
                  </button>
                </form>

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => void forgotPassword()}
                    className="mt-3 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {copy.forgot}
                  </button>
                )}

                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  {copy.or}
                  <span className="h-px flex-1 bg-border" />
                </div>

                <button
                  type="button"
                  onClick={() => void googleSignIn()}
                  disabled={submitting}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-border/80 bg-background px-5 py-3.5 text-[0.76rem] font-bold uppercase tracking-[0.06em] transition hover:border-primary/30 hover:bg-muted/50 disabled:opacity-50"
                >
                  <span className="font-semibold">G</span>
                  {copy.google}
                </button>

                {mode === "register" && (
                  <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
                    {copy.privacyLead}{" "}
                    <Link to="/terms" className="font-medium underline underline-offset-2">
                      {copy.terms}
                    </Link>{" "}
                    &{" "}
                    <Link to="/privacy" className="font-medium underline underline-offset-2">
                      {copy.privacy}
                    </Link>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
