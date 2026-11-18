import { constructMetadata } from "@/config/site";
import { securityPillars } from "@/features/marketing/content";
import { CtaBanner, FeatureGrid, PageHero, Section } from "@/features/marketing/components/blocks";

export const metadata = constructMetadata({
  title: "Security",
  description: "How ChaiAuth protects accounts: hashed passwords, passkeys, MFA, rotating sessions and strict OAuth rules.",
});

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title={<>Security is the <span className="ca-text-chai">product</span></>}
        subtitle="Defense in depth, from the login form to the token endpoint."
      />
      <Section>
        <FeatureGrid items={securityPillars} />
      </Section>
      <Section>
        <div className="ca-glass mx-auto max-w-2xl rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-foreground">Found a vulnerability?</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-soft">
            Report it privately to{" "}
            <a href="mailto:security@chaiauth.com" className="text-primary hover:underline">security@chaiauth.com</a>.
          </p>
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
