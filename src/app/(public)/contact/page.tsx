import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = {
  title: "Contact",
  description: "Get in touch with RaffleRadar.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="bg-rr-bg">
      <PageHero
        id="contact-page-intro"
        eyebrow="Get in touch"
        title={
          <>
            Let’s fix it, build it,{" "}
            <span className="text-rr-green">or talk about it</span>
          </>
        }
        lead="Questions about the site, an operator listing, partnerships, press, or something that looks off? Send a message and we will get back to you by email."
      />

      <section className="pb-12 pt-6 md:pb-16 md:pt-4">
        <div className="container">
          <div className="mx-auto max-w-[1100px]">
            <div className="rounded-[28px] bg-rr-elevated/70 p-1.5 shadow-sm sm:p-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
