import { Mail, ShieldCheck, BookOpen } from "lucide-react";
import { constructMetadata } from "@/config/site";
import { PageHero, Section } from "@/features/marketing/components/blocks";
import { ContactForm } from "@/features/marketing/components/ContactForm";

export const metadata = constructMetadata({
  title: "Contact",
  description: "Get in touch with the ChaiAuth team.",
});

const channels = [
  { icon: Mail, title: "General", text: "hello@chaiauth.com" },
  { icon: ShieldCheck, title: "Security reports", text: "security@chaiauth.com" },
  { icon: BookOpen, title: "Docs & help", text: "Start with the documentation" , href: "/docs" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Let&apos;s <span className="ca-text-chai">talk</span></>}
        subtitle="Questions, feedback or partnership ideas? Send us a note."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {channels.map(({ icon: Icon, title, text, href }) => (
              <div key={title} className="ca-glass flex items-start gap-4 rounded-2xl p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  {href ? (
                    <a href={href} className="text-sm text-primary hover:underline">{text}</a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
