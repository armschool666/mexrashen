import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "../../../../i18n/navigation";
import { SiteShell } from "../../../components";
import { ContactForm } from "../../../contact-form";
import { mapEmbedUrl, schoolConfig, type SchoolLocale } from "../../../../school.config";

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const locale = (await getLocale()) as SchoolLocale;

  return (
    <SiteShell>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="subhero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={schoolConfig.assets.heroImage}
          alt={schoolConfig.name[locale]}
        />
        <div>
          <Link href="/">{t("homeLink")}</Link>
          <h1>{schoolConfig.name[locale]}</h1>
          <p>{t("description")}</p>
        </div>
      </section>

      <div className="section-wrap">
        {/* ── Contact info cards ───────────────────────────────── */}
        <section aria-labelledby="contact-info-heading">
          <div className="section-heading">
            <p className="eyebrow">{t("infoEyebrow")}</p>
            <h2 id="contact-info-heading">{t("infoTitle")}</h2>
          </div>

          <div className="contact-info-grid">
            {schoolConfig.address[locale] ? (
              <div className="contact-info-card">
                <p className="eyebrow">{t("addressLabel")}</p>
                <strong>{schoolConfig.address[locale]}</strong>
              </div>
            ) : null}

            {schoolConfig.phone.display ? (
              <div className="contact-info-card">
                <p className="eyebrow">{t("phoneLabel")}</p>
                <strong>
                  <a href={`tel:${schoolConfig.phone.tel}`}>{schoolConfig.phone.display}</a>
                </strong>
              </div>
            ) : null}

            {schoolConfig.email ? (
              <div className="contact-info-card">
                <p className="eyebrow">{t("emailLabel")}</p>
                <strong>
                  <a href={`mailto:${schoolConfig.email}`}>{schoolConfig.email}</a>
                </strong>
              </div>
            ) : null}
          </div>
        </section>

        {/* ── Feedback form + Map ──────────────────────────────── */}
        <section className="contact-columns" aria-label={t("feedbackEyebrow")}>
          {/* Feedback form */}
          <div className="contact-form-wrap" id="feedback">
            <div className="section-heading">
              <p className="eyebrow">{t("feedbackEyebrow")}</p>
              <h2>{t("feedbackTitle")}</h2>
            </div>
            <p>{t("feedbackDescription")}</p>

            <ContactForm
              recipientEmail={schoolConfig.email}
              labels={{
                name: t("feedbackName"),
                namePlaceholder: t("feedbackNamePlaceholder"),
                email: t("feedbackEmail"),
                emailPlaceholder: t("feedbackEmailPlaceholder"),
                message: t("feedbackMessage"),
                messagePlaceholder: t("feedbackMessagePlaceholder"),
                send: t("feedbackSend"),
                sending: t("feedbackSending"),
                sent: t("feedbackSent"),
              }}
            />
          </div>

          {/* Map */}
          <div className="contact-map-wrap" id="map">
            <div className="section-heading">
              <p className="eyebrow">{t("mapEyebrow")}</p>
              <h2>{t("mapTitle")}</h2>
            </div>
            <p>{schoolConfig.address[locale]}</p>

            <div className="contact-map-frame">
              <iframe
                src={mapEmbedUrl()}
                title={t("mapAriaLabel")}
                aria-label={t("mapAriaLabel")}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        {/* ── Social links ─────────────────────────────────────── */}
        <section className="contact-social" aria-labelledby="social-heading">
          <div className="section-heading">
            <p className="eyebrow">{t("socialEyebrow")}</p>
            <h2 id="social-heading">{t("socialTitle")}</h2>
          </div>
          <p style={{ color: "var(--muted)", margin: "0 0 4px" }}>
            {t("socialDescription")}
          </p>

          <div className="contact-social-links">
            {schoolConfig.social.facebook ? (
            <a
              href={schoolConfig.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="contact-social-link"
              aria-label={t("facebookLabel")}
            >
              {/* Facebook icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54v-2.2c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.88h-2.33v6.99A10 10 0 0 0 22 12z" />
              </svg>
              Facebook
            </a>
            ) : null}

            {schoolConfig.social.youtube ? (
            <a
              href={schoolConfig.social.youtube}
              target="_blank"
              rel="noreferrer"
              className="contact-social-link"
              aria-label={t("youtubeLabel")}
            >
              {/* YouTube icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.57 3.5 12 3.5 12 3.5s-7.57 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.13C4.43 20.5 12 20.5 12 20.5s7.57 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.13A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z" />
              </svg>
              YouTube
            </a>
            ) : null}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
