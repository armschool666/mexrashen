"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { schoolConfig, type SchoolLocale } from "../../../school.config";

export default function LoginPage() {
  const t = useTranslations("login");
  const locale = useLocale() as SchoolLocale;
  const initial = schoolConfig.shortName[locale].slice(0, 1);
  const [login, setLogin] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, token }),
      });

      if (response.ok) {
        window.location.href = "/admin";
      } else if (response.status === 429) {
        setError(t("tooManyAttempts"));
      } else {
        setError(t("invalidCredentials"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-logo">{initial}</div>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>

        <label>
          {t("loginLabel")}
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder={t("loginPlaceholder")}
            autoFocus
            autoComplete="username"
            required
          />
        </label>

        <label>
          {t("passwordLabel")}
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="login-error">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>
    </main>
  );
}
