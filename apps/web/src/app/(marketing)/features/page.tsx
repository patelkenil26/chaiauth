import { constructMetadata } from "@/config/site";
import { features } from "@/features/marketing/content";
import { CtaBanner, FeatureGrid, PageHero, Section } from "@/features/marketing/components/blocks";

export const metadata = constructMetadata({
  title: "Features",
  description: "Passwords, social login, MFA, passkeys, OIDC and a developer console, all in ChaiAuth.",
});

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={<>One platform for <span className="ca-text-chai">every sign-in</span></>}
        subtitle="From a first password to passwordless passkeys, ChaiAuth covers the whole identity lifecycle for your users and your apps."
      />
      <Section>
        <FeatureGrid items={features} />
      </Section>
      <CtaBanner />
    </>
  );
}
