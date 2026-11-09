import { Coffee, ShieldCheck, Code2 } from "lucide-react";
import { constructMetadata } from "@/config/site";
import { CtaBanner, FeatureGrid, PageHero, Section } from "@/features/marketing/components/blocks";

export const metadata = constructMetadata({
  title: "About",
  description: "Why we are building ChaiAuth.",
});

const values = [
  { icon: ShieldCheck, title: "Secure by default", description: "Safe choices should be the easy ones. Defaults protect users without extra setup." },
  { icon: Code2, title: "Open standards", description: "We build on OpenID Connect, OAuth 2.0 and WebAuthn so you are never locked in." },
  { icon: Coffee, title: "Human-friendly", description: "Auth does not have to feel cold. Clear screens, honest errors, and a little warmth." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>Auth, brewed <span className="ca-text-chai">properly</span></>}
        subtitle="ChaiAuth started as a learning project in building a complete authentication system from scratch, and grew into an identity provider we would want to use ourselves."
      />
      <Section title="What we believe">
        <FeatureGrid items={values} />
      </Section>
      <CtaBanner title="Want to build with us?" subtitle="Try ChaiAuth, or get in touch with feedback and ideas." />
    </>
  );
}
