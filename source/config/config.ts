import { env } from "node:process";
import { config as dotenv } from "dotenv";
dotenv();

export const MONGO_URL = `mongodb+srv://${env["DB_USERNAME"]}:${env["DB_PASSWORD"]}@${env["DB_HOST"]}/${env["DB_NAME"]}`;

export const PORT = env["PORT"];
