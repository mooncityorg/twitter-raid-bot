import type { I18nFlavor } from "@grammyjs/i18n";
import type { Context as BaseContext, SessionFlavor } from "grammy";
import { type ChatMembersFlavor } from "@grammyjs/chat-members";

export type Session = {
	page?: number;
	userReaction?: string;
};

export type MyContext = BaseContext &
	SessionFlavor<Session> &
	I18nFlavor &
	ChatMembersFlavor;
