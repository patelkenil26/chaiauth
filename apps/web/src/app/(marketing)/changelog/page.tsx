import { constructMetadata } from "@/config/site";
import { PageHero, Section } from "@/features/marketing/components/blocks";

export const metadata = constructMetadata({
  title: "Changelog",
  description: "What is new in ChaiAuth.",
});

const entries = [
  {
    version: "Upcoming",
    tag: "Roadmap",
    items: ["Application API keys", "@chaiauth/react SDK with <SignIn /> and <UserButton />"],
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
      <PageHero eyebrow="Changelog" title={<>What&apos;s <span className="ca-text-chai">new</span></>} subtitle="Product updates and what is coming next." />
      <Section>
        <ol className="mx-auto max-w-3xl space-y-5">
          {entries.map((e) => (
            <li key={e.version} className="ca-glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">{e.version}</h2>
                <span className="ca-soon">{e.tag}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-text-soft">
                {e.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
