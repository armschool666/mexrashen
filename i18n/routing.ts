import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hy", "ru", "en"],
  defaultLocale: "ru",
});

export type Locale = (typeof routing.locales)[number];
