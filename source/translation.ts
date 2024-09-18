import {I18n} from '@grammyjs/i18n';

export const i18n = new I18n({
	defaultLocale: 'en',
	useSession: true,
	directory: 'locales',
});

// TODO: get this from the context directly. Maybe `ctx.i18n.getAvailableLocales()`?
export function getAvailableLocales(): readonly string[] {
	return i18n.locales;
}
