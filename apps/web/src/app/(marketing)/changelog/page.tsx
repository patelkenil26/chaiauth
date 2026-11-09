import { constructMetadata } from "@/config/site";
import { PageHero, Section } from "@/features/marketing/components/blocks";
import { Reveal } from "@/features/marketing/components/Reveal";

export const metadata = constructMetadata({
  title: "Changelog",
  description: "What is new in ChaiAuth.",
});

const entries = [
  {
    version: "Passwordless sign-in & developer tools",
    tag: "New",
    items: [
      "Magic links: sign in with a one-time email link (single use, 15 minutes, MFA still enforced)",
      "Application API keys and a server API to read the users who approved your app",
      "@chaiauth/react SDK with <SignIn />, <UserButton /> and hooks, built on PKCE",
      "Apps are now told when a user cancels the consent screen (access_denied)",
    ],
  },
  {
    version: "Social login hardening",
    tag: "Improved",
    items: ["Tokens no longer appear in the URL after Google / GitHub login", "Clear error toast when social sign-in fails"],
  },
  {
    version: "OIDC provider & developer console",
    tag: "New",
    items: ["Authorization Code flow with PKCE and consent screen", "Register apps, manage callbacks and rotate secrets"],
  },
  {
    version: "Account management",
    tag: "New",
    items: ["Profile and password updates", "Sessions & devices, security activity", "Data export and account deletion"],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <PageHero
        eyebrow="Changelog"
        title={<>What&apos;s <span className="ca-text-chai-anim">new</span></>}
        subtitle="Product updates and what is coming next."
      />
      <Section>
        <ol className="relative mx-auto max-w-3xl space-y-6 pl-8 sm:pl-10">
          <span className="absolute bottom-2 left-[0.55rem] top-2 w-px bg-gradient-to-b from-[var(--chai-mid)] via-border to-transparent sm:left-[0.8rem]" />
          {entries.map((e, i) => (
            <Reveal as="li" key={e.version} delay={i * 80} className="relative">
              <span className="absolute -left-8 top-7 grid h-4 w-4 place-items-center rounded-full border border-primary/60 bg-background sm:-left-10">
                <span className={`h-1.5 w-1.5 rounded-full bg-primary ${i === 0 ? "ca-pulse" : ""}`} />
              </span>
              <div className="ca-glass rounded-2xl p-6 transition-colors hover:border-primary/40">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{e.version}</h2>
                  <span className="ca-soon">{e.tag}</span>
                </div>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-text-soft marker:text-primary">
                  {e.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>
    </>
  );
}
