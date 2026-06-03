/**
 * Конфиг конкретной школы.
 *
 * Это единственное место, которое нужно менять, чтобы клонировать сайт
 * под другую школу. Тексты (название, описание, адрес) локализованы:
 * правьте здесь — никаких хардкодов в коде или messages/*.json.
 */

export type SchoolLocale = "hy" | "ru" | "en";

type LocalizedString = Record<SchoolLocale, string>;

export interface SchoolConfig {
  /** Домен сайта без протокола, для SEO/metadata */
  domain: string;
  /** Email школы — используется в footer, contact page, mailto-форме */
  email: string;
  /** Телефон в международном формате (для tel:) и локально для отображения */
  phone: {
    display: string;
    tel: string;
  };
  /** Соц. сети — оставить пустую строку, чтобы скрыть ссылку */
  social: {
    facebook: string;
    youtube: string;
  };
  /** Координаты для встроенной карты OpenStreetMap */
  map: {
    lat: number;
    lon: number;
    /** Половина видимого охвата карты по широте/долготе (градусы) */
    bboxRadius: number;
  };
  /** Логотип и hero-изображение из /public */
  assets: {
    logo: string;
    heroImage: string;
  };
  /** Локализованные строки */
  name: LocalizedString;
  shortName: LocalizedString;
  tagline: LocalizedString;
  address: LocalizedString;
  region: LocalizedString;
}

export const schoolConfig: SchoolConfig = {
  domain: "meghrashen.am",
  email: "meghrashendproc@mail.ru",
  phone: {
    display: "+374 94 84 00 50",
    tel: "+37494840050",
  },
  social: {
    facebook: "https://www.facebook.com/share/1Jp8rCLn5Y/?mibextid=wwXIfr",
    youtube: "",
  },
  map: {
    lat: 40.67583,
    lon: 43.94861,
    bboxRadius: 0.02,
  },
  assets: {
    logo: "/logo.jpg",
    heroImage: "/school.jpg",
  },
  name: {
    hy: "Մեղրաշենի միջնակարգ դպրոց",
    ru: "Меграшенская средняя школа",
    en: "Meghrashen Secondary School",
  },
  shortName: {
    hy: "Մեղրաշեն",
    ru: "Меграшен",
    en: "Meghrashen",
  },
  tagline: {
    hy: "Պաշտոնական տեղեկատվական հարթակ",
    ru: "Официальный информационный портал",
    en: "Official information portal",
  },
  address: {
    hy: "Շիրակի մարզ, բնակավայր Մեղրաշեն, 4 փողոց, 6 շենք",
    ru: "Ширакская область, с. Меграшен, улица 4, здание 6",
    en: "Shirak Region, Meghrashen, 4th Street, Building 6",
  },
  region: {
    hy: "Շիրակի մարզ",
    ru: "Ширакская область",
    en: "Shirak Region",
  },
};

export function bboxString(): string {
  const { lat, lon, bboxRadius } = schoolConfig.map;
  return [
    lon - bboxRadius,
    lat - bboxRadius / 2,
    lon + bboxRadius,
    lat + bboxRadius / 2,
  ].join(",");
}

export function mapEmbedUrl(): string {
  const { lat, lon } = schoolConfig.map;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bboxString()}&layer=mapnik&marker=${lat},${lon}`;
}
