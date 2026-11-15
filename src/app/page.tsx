import Link from "next/link";
import {
  ArrowRight,
  Wrench,
  Send,
  UserCheck,
  Activity,
  GraduationCap,
  HardHat,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const STEPS = [
  {
    icon: Send,
    title: "Snap & log in 30 seconds",
    desc: "Pick a fault category, enter the room or block, attach a quick photo from your phone, and send it straight to the desk.",
  },
  {
    icon: UserCheck,
    title: "Dispatched in 1 click",
    desc: "Facilities administrators see urgent tickets immediately and assign the right technician without delay.",
  },
  {
    icon: Activity,
    title: "Live status until fixed",
    desc: "Every technician note and status change is time-stamped on your timeline, so you are never left guessing.",
  },
];

const ROLES = [
  {
    icon: GraduationCap,
    role: "STUDENT_STAFF",
    tag: "Requester",
    title: "Student / Staff",
    desc: "Report hostel, lecture hall, electrical, plumbing, or Wi-Fi faults in seconds and follow every repair step live.",
    bg: "var(--tertiary-container-color)",
    fg: "var(--on-tertiary-container-color)",
  },
  {
    icon: HardHat,
    role: "MAINTENANCE_OFFICER",
    tag: "Resolver",
    title: "Maintenance Officer",
    desc: "Open a clean mobile job queue sorted by priority, inspect fault photos on site, and log repair completion in two taps.",
    bg: "var(--secondary-container-color)",
    fg: "var(--on-secondary-container-color)",
  },
  {
    icon: ShieldCheck,
    role: "ADMIN",
    tag: "Controller",
    title: "Administrator",
    desc: "Triage incoming campus faults, dispatch technicians, provision staff accounts, and export SLA compliance reports.",
    bg: "var(--primary-container-color)",
    fg: "var(--on-primary-container-color)",
  },
];

const TICKET_STEPS = [
  { label: "Logged by student", status: "Pending", done: true },
  { label: "Technician dispatched", status: "Assigned", done: true },
  { label: "Repair underway on site", status: "In Progress", done: false },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MivaFix",
  alternateName: "MIVA Open University Maintenance & Service Request System",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  description:
    "Don't wonder if your maintenance complaint was ever read. Log any hostel, lecture hall, or office fault from your phone and track the technician's progress live.",
  provider: {
    "@type": "EducationalOrganization",
    name: "MIVA Open University",
    url: "https://miva.university",
  },
  featureList: [
    "30-second mobile fault reporting with photo evidence",
    "One-click technician assignment and priority triage",
    "Real-time repair status timeline and audit trail",
    "Role-based portals for Students/Staff, Maintenance Officers, and Administrators",
  ],
};

const card = {
  backgroundColor: "var(--surface-container-lowest-color)",
  border: "1px solid var(--outline-variant-color)",
  borderRadius: "var(--radius-xl)",
  boxShadow: "var(--elevation-1)",
} as const;

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl">
      <p
        className="font-semibold uppercase"
        style={{
          color: "var(--tertiary-color)",
          fontSize: "var(--font-size-xs)",
          letterSpacing: "var(--letter-spacing-widest)",
        }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-2 font-bold"
        style={{
          color: "var(--on-surface-color)",
          fontSize: "clamp(var(--font-size-2xl), 4vw, var(--font-size-4xl))",
          lineHeight: "var(--line-height-tight)",
          letterSpacing: "var(--letter-spacing-tight)",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-2"
          style={{
            color: "var(--on-surface-variant-color)",
            fontSize: "var(--font-size-base)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background-color)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* 1. Sticky navbar */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          backgroundColor: "var(--surface-container-lowest-color)",
          borderColor: "var(--outline-variant-color)",
        }}
      >
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2"
        >
          <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="MivaFix home">
            <img
              src="/images/miva-logo.png"
              alt="MIVA Open University logo"
              className="h-8 w-auto object-contain"
            />
            <span
              className="hidden h-8 w-8 items-center justify-center sm:flex"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--on-primary-color)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <Wrench className="h-4 w-4" />
            </span>
            <span className="font-bold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-lg)" }}>
              MivaFix
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {[
              { href: "#how-it-works", label: "How it works" },
              { href: "#roles", label: "Campus portals" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[44px] items-center px-3 font-medium hover:opacity-80"
                style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center px-5 font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--on-primary-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main>
        {/* 2. Hero */}
        <section
          aria-label="Hero"
          className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-20"
        >
          <div>
            <h1
              className="font-bold"
              style={{
                color: "var(--primary-color)",
                fontSize: "clamp(var(--font-size-4xl), 6.5vw, var(--font-size-6xl))",
                lineHeight: "var(--line-height-none)",
                letterSpacing: "var(--letter-spacing-tight)",
              }}
            >
              Campus Repairs, Done Right the First Time.
            </h1>

            <p
              className="mt-5 max-w-xl"
              style={{
                color: "var(--on-surface-variant-color)",
                fontSize: "clamp(var(--font-size-base), 2vw, var(--font-size-lg))",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Don&apos;t wonder if your maintenance complaint was ever read. Log any hostel, lecture
              hall, or office fault from your phone and track the technician&apos;s progress live.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--on-primary-color)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--elevation-2)",
                }}
              >
                Report an Issue Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?mode=register"
                className="inline-flex min-h-[48px] items-center justify-center px-6 font-semibold border transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: "var(--surface-container-lowest-color)",
                  color: "var(--primary-color)",
                  borderColor: "var(--outline-variant-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                New User Sign Up
              </Link>
            </div>
          </div>

          {/* Sample ticket preview */}
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <div style={{ ...card, padding: "var(--spacing-6)", boxShadow: "var(--elevation-4)" }}>
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-semibold"
                  style={{
                    backgroundColor: "var(--secondary-container-color)",
                    color: "var(--on-secondary-container-color)",
                    padding: "var(--spacing-0_5) var(--spacing-2_5)",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Live ticket tracker
                </span>
                <span className="font-semibold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xs)" }}>
                  MIVA-2026-014
                </span>
              </div>

              <h3 className="mt-4 font-bold" style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-xl)" }}>
                Broken tap, Hostel Block B
              </h3>
              <p
                className="mt-1 flex items-center gap-1.5"
                style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}
              >
                <MapPin className="h-4 w-4 shrink-0" />
                Plumbing · High priority
              </p>

              <ol className="mt-5 space-y-3">
                {TICKET_STEPS.map((step) => (
                  <li
                    key={step.status}
                    className="flex items-center justify-between gap-3"
                    style={{
                      backgroundColor: "var(--surface-container-low-color)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--spacing-3) var(--spacing-4)",
                    }}
                  >
                    <span className="flex items-center gap-2.5" style={{ fontSize: "var(--font-size-sm)" }}>
                      <span
                        className="h-2.5 w-2.5 shrink-0"
                        style={{
                          backgroundColor: step.done ? "var(--tertiary-color)" : "var(--secondary-color)",
                          borderRadius: "var(--radius-full)",
                        }}
                      />
                      <span style={{ color: "var(--on-surface-color)" }}>{step.label}</span>
                    </span>
                    <span
                      className="font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: step.done ? "var(--primary-container-color)" : "var(--primary-color)",
                        color: step.done ? "var(--on-primary-container-color)" : "var(--on-primary-color)",
                        padding: "var(--spacing-0_5) var(--spacing-2_5)",
                        borderRadius: "var(--radius-full)",
                        fontSize: "var(--font-size-xs)",
                      }}
                    >
                      {step.status}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 3a. How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 lg:py-14">
          <SectionHeading
            eyebrow="How it works"
            title="One Clear Loop from Report to Repair"
            subtitle="No lost messages, no guesswork. Every fault follows a fast, accountable workflow across campus."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
                style={{ ...card, padding: "var(--spacing-6)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center font-bold"
                    style={{
                      backgroundColor: "var(--secondary-container-color)",
                      color: "var(--on-secondary-container-color)",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <step.icon className="h-5 w-5" style={{ color: "var(--primary-color)" }} />
                </div>
                <h3 className="mt-4 font-semibold" style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-lg)" }}>
                  {step.title}
                </h3>
                <p className="mt-1.5" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3b. Roles */}
        <section id="roles" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 lg:py-14">
          <SectionHeading
            eyebrow="Campus portals"
            title="The Right Tools for Every Role on Campus"
            subtitle="Dedicated dashboards tailored to the people who report issues, the technicians who fix them, and the admins who oversee operations."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {ROLES.map((role) => (
              <Link
                key={role.title}
                href={`/login?role=${role.role}`}
                aria-label={`Sign in to the ${role.title} portal`}
                className="group flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg focus:outline-none focus:ring-2"
                style={{ ...card, padding: "var(--spacing-6)" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="flex h-11 w-11 items-center justify-center transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: "var(--surface-container-low-color)",
                        borderRadius: "var(--radius-lg)",
                      }}
                    >
                      <role.icon className="h-6 w-6" style={{ color: "var(--primary-color)" }} />
                    </span>
                    <span
                      className="font-semibold"
                      style={{
                        backgroundColor: role.bg,
                        color: role.fg,
                        padding: "var(--spacing-0_5) var(--spacing-2_5)",
                        borderRadius: "var(--radius-full)",
                        fontSize: "var(--font-size-xs)",
                      }}
                    >
                      {role.tag}
                    </span>
                  </div>
                  <h3
                    className="mt-4 font-semibold"
                    style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-lg)" }}
                  >
                    {role.title}
                  </h3>
                  <p
                    className="mt-1.5"
                    style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}
                  >
                    {role.desc}
                  </p>
                </div>

                <div
                  className="mt-5 flex items-center gap-1.5 font-semibold"
                  style={{ color: "var(--primary-color)", fontSize: "var(--font-size-sm)" }}
                >
                  <span>Sign in to portal</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. CTA banner */}
        <section className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
          <div
            className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between"
            style={{
              backgroundColor: "var(--primary-color)",
              borderRadius: "var(--radius-3xl)",
              padding: "var(--spacing-8)",
              boxShadow: "var(--elevation-3)",
            }}
          >
            <div>
              <h2
                className="font-bold"
                style={{
                  color: "var(--on-primary-color)",
                  fontSize: "clamp(var(--font-size-2xl), 4vw, var(--font-size-3xl))",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Ready to Report a Fault? Takes Under a Minute.
              </h2>
              <p className="mt-2" style={{ color: "var(--primary-container-color)", fontSize: "var(--font-size-base)" }}>
                Sign in or create your student/staff account and get our maintenance team on the job today.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/login?mode=register"
                className="inline-flex min-h-[48px] items-center justify-center whitespace-nowrap px-6 font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--secondary-container-color)",
                  color: "var(--on-secondary-container-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                New User
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-[48px] items-center justify-center whitespace-nowrap px-6 font-semibold border transition-opacity hover:opacity-85"
                style={{
                  color: "var(--on-primary-color)",
                  borderColor: "var(--primary-container-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Report an Issue
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "var(--outline-variant-color)" }}>
        <div
          className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 sm:flex-row sm:items-center"
          style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}
        >
          <p>MivaFix · Official Campus Maintenance Platform, MIVA Open University · © 2026</p>
        </div>
      </footer>
    </div>
  );
}
