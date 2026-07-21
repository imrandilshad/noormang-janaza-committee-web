import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PublicContactPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
            <Phone className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t("public.contactTitle")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("public.contactSubtitle")}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Contact Details */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t("public.contactAddress")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("public.addressText")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="h-5 w-5 text-primary" />
                    {t("public.contactPhone")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("public.rolePresident")}
                    </p>
                    <a
                      href="tel:+923000000000"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      0300-0000000
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("public.roleSecretary")}
                    </p>
                    <a
                      href="tel:+923000000000"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      0300-0000000
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-5 w-5 text-primary" />
                    {t("public.contactEmail")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href="mailto:noormangcommittee@gmail.com"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    noormangcommittee@gmail.com
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t("public.location")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "75%" }}
                  >
                    <iframe
                      title="Noormang Village Map"
                      className="absolute inset-0 w-full h-full border-0 rounded-b-xl"
                      src="https://maps.google.com/maps?q=Noormang+Pakistan&output=embed&z=13"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <a
                  href="https://maps.app.goo.gl/8RRuUjjCXLwCM63u6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  {t("public.openInMaps")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
