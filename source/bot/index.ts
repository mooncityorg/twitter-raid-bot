import { env } from "node:process";
import { FileAdapter } from "@grammyjs/storage-file";
import { config as dotenv } from "dotenv";
import { Bot, session, MemorySessionStorage } from "grammy";
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";
import { type ChatMember } from "grammy/types";
import { chatMembers } from "@grammyjs/chat-members";
import { CronJob } from "cron";
import { i18n } from "../translation.js";
import { menu } from "./menu/index.js";
import type { MyContext, Session } from "./my-context.js";
import { updateRaid } from "../utils.js";
import { RaidCommand } from "./command/raid.js";
import { VerifyCommand } from "./command/verify.js";
import { ResumeCommand } from "./command/resume.js";
import { StartCommand } from "./command/start.js";
import { MessageQuery } from "./query/message.js";

dotenv(); // Load from .env file
const token = env["BOT_TOKEN"];
if (!token) {
	throw new Error(
		"You have to provide the bot-token from @BotFather via environment variable (BOT_TOKEN)",
	);
}

const adapter = new MemorySessionStorage<ChatMember>();
const bot = new Bot<MyContext>(token);

bot.use(
	session({
		initial: (): Session => ({ userReaction: "" }),
		storage: new FileAdapter(),
	}),
);
bot.use(chatMembers(adapter));
bot.use(menu);
bot.use(i18n.middleware());

if (env["NODE_ENV"] !== "production") {
	// Show what telegram updates (messages, button clicks, ...) are happening (only in development)
	bot.use(generateUpdateMiddleware());
}

bot.command("raid", async (ctx) => {
	await RaidCommand(ctx);
});

bot.command("verify", async (ctx) => {
	await VerifyCommand(ctx);
});

bot.command("resume", async (ctx) => {
	await ResumeCommand(ctx);
});

bot.command("start", (ctx) => {
	StartCommand(ctx);
});

bot.on("message", async (ctx) => {
	await MessageQuery(ctx);
});

bot.catch((error) => {
	console.error("ERROR on handling update occured", error);
});

export async function start(): Promise<void> {
	// The commands you set here will be shown as /commands like /start or /magic in your telegram client.
	await bot.api.setMyCommands([
		{ command: "raid", description: "raid the tweet" },
		{ command: "verify", description: "verity the x-account" },
		{ command: "resume", description: "end this raid" },
	]);

	// await setMarks();
	await bot.start({
		onStart(botInfo) {
			console.log(new Date(), "Bot starts as", botInfo.username);
		},
	});
}

// Run the `summaryRaid` function every 3 minutes
const raidSummarizeJob = new CronJob("*/3 * * * *", updateRaid);
raidSummarizeJob.start();
