import fs from "fs";
import path from "path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "../../../../../i18n/navigation";
import { SiteShell } from "../../../../components";

export default async function LeadershipPage() {
  const t = await getTranslations();

  const bioRaw = fs.readFileSync(
    path.join(process.cwd(), "public", "tnorn.txt"),
    "utf-8",
  );

  const bioLines = bioRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const [titleLine, nameLine, ...restLines] = bioLines;

  return (
    <SiteShell>
      <section className="subhero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tnoren.JPG" alt={nameLine ?? "Տnøрении"} loading="lazy" />
        <div>
          <Link href="/section/staff">{t("nav.staff")}</Link>
          <h1>{t("nav.staffLeadership")}</h1>
          <p>{titleLine}</p>
        </div>
      </section>

      <div className="section-wrap" style={{ padding: "48px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "clamp(200px, 25%, 300px) 1fr",
            gap: "48px",
            alignItems: "start",
          }}
        >
          <div>
            <Image
              src="/tnoren.JPG"
              alt={nameLine ?? "Տnøрении"}
              width={300}
              height={400}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid var(--line)",
              }}
            />
          </div>

          <div>
            <p className="eyebrow">{t("nav.staffLeadership")}</p>
            <h2 style={{ margin: "0 0 24px", fontSize: "clamp(24px, 3vw, 36px)" }}>
              {nameLine}
            </h2>
            {restLines.map((line, i) => (
              <p
                key={i}
                style={{ lineHeight: "1.8", marginBottom: "12px", color: "var(--ink)" }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
