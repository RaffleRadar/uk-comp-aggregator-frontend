import { ContactForm } from "@/components/contact/contact-form";

export const metadata = {
  title: "Contact",
  description: "Get in touch with RaffleRadar.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="bg-rr-bg">
      <section className="py-10">
        <div className="container">
          <div className="mx-auto max-w-[780px] lg:max-w-[860px]">
            <div id="contact-page-intro">
              <h1 className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl">
                Let’s fix it, build it, or talk about it
              </h1>
              <p className="mt-4 max-w-[700px] text-[15.5px] leading-7 text-rr-secondary">
                Questions about the site, an operator listing, partnerships, press, or something that
                looks off? Send a message and we will get back to you by email.
              </p>
            </div>

            <div className="mt-10 rounded-[28px] bg-rr-elevated/70 p-1.5 shadow-sm sm:p-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
