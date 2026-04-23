import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import Container from "@/components/ui/Container";
import { ContactForm } from "@/components/ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";
import PageHero from "@/components/PageHero";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <PageHero
          title="Contact Us"
          description="Have questions about Ludeva investment opportunities or need guidance getting started? Our team is here to assist you."
          imageSrc="/images/hero-contact.png"
        />

        <section className="py-16 md:py-24">
          <Container>
            <div className="grid gap-12 md:grid-cols-2">

              {/* Contact Form */}
              <div className="rounded-lg border bg-card p-8">
                <h2 className="mb-6 text-2xl font-bold font-headline">
                  Send us a message
                </h2>

                <p className="mb-6 text-muted-foreground">
                  Select the department you want to contact and send us your message.
                </p>

                <ContactForm />
              </div>

              {/* Contact Details */}
              <div className="space-y-8">

                <div>
                  <h3 className="flex items-center gap-3 text-xl font-semibold">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Departments
                  </h3>

                  <div className="mt-3 flex flex-col gap-1 text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        General Inquiries:
                      </span>{" "}
                      info@ludevaplc.co.ke
                    </p>

                    <p>
                      <span className="font-medium text-foreground">
                        Consultation:
                      </span>{" "}
                      keziahodemba@ludevaplc.co.ke
                    </p>

                    <p>
                      <span className="font-medium text-foreground">
                        Investment:
                      </span>{" "}
                      invest@ludevaplc.co.ke
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-3 text-xl font-semibold">
                    <Phone className="h-5 w-5 text-primary" />
                    Call Us
                  </h3>

                  <div className="mt-2 flex flex-col gap-1 text-muted-foreground">
                    <p>0732 722 101</p>
                    <p>0712 940 012</p>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-3 text-xl font-semibold">
                    <Phone className="h-5 w-5 text-primary" />
                    Diaspora Investment
                  </h3>

                  <div className="mt-2 flex flex-col gap-1 text-muted-foreground">
                    <p>+44 7944 618740</p>
                    <p>0716 747 445</p>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-3 text-xl font-semibold">
                    <MapPin className="h-5 w-5 text-primary" />
                    Postal Address
                  </h3>

                  <p className="mt-2 text-muted-foreground">
                    Ludeva Public Ltd.
                    <br />
                    P.O Box 596-4043
                    <br />
                    Homabay, Kenya
                  </p>
                </div>

              </div>
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}