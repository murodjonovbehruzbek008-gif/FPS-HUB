import en from '@/locales/en.json';
import uz from '@/locales/uz.json';

export type Locale = 'en' | 'uz';
export type Messages = typeof en;
export type MsgKey = keyof Messages;

const dict: Record<Locale, Messages> = { en, uz };

export function isLocale(v: string | undefined | null): v is Locale {
  return v === 'en' || v === 'uz';
}

export function translate(locale: Locale, key: MsgKey): string {
  return dict[locale][key] ?? dict.en[key] ?? String(key);
}

export function getTranslator(locale: Locale) {
  return {
    loc: locale,
    t: (key: MsgKey) => translate(locale, key),
  };
}
