import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "../../i18n/navigation";
import type { Locale } from "../../i18n/routing";
import { schoolConfig } from "../../school.config";
import { SiteShell } from "../components";
import { sections, news } from "../data";

const FEATURED_SLUGS = ["about", "councils", "learning", "events"];

export default async function Home() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const featured = sections.filter((s) => FEATURED_SLUGS.includes(s.slug));

  return (
    <SiteShell>
      <section className="hero">
        <Image
          src={schoolConfig.assets.heroImage}
          alt={t("home.heroImgAlt")}
          width={1600}
          height={900}
          priority
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
        <div className="hero-content">
          <p className="eyebrow">{schoolConfig.region[locale]}</p>
          <h1>{schoolConfig.name[locale]}</h1>
          <p>{t("home.heroDescription")}</p>
          <div className="hero-actions">
            <Link href="/section/about">{t("home.btnAbout")}</Link>
            <Link href="/section/events">{t("home.btnEvents")}</Link>
          </div>
        </div>
      </section>

      <section className="quick-panel">
        {news.map((item) => (
          <article key={item.title} className="notice-card">
            <span>{item.category}</span>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <small>{item.date}</small>
          </article>
        ))}
      </section>

      <section className="section-wrap">
        <div className="section-heading">
          <p className="eyebrow">{t("home.structureEyebrow")}</p>
          <h2>{t("home.structureTitle")}</h2>
        </div>
        <div className="card-grid">
          {featured.map((section) => (
            <Link
              href={`/section/${section.slug}`}
              className="feature-card"
              key={section.slug}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={section.image} alt={section.title} loading="lazy" />
              <div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-wrap split">
        <div>
          <p className="eyebrow">{t("home.platformEyebrow")}</p>
          <h2>{t("home.platformTitle")}</h2>
          <p>{t("home.platformDescription")}</p>
        </div>
      </section>
    </SiteShell>
  );
}
