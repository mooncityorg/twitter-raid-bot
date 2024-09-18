import { buildApiService } from "./api/service/index.js";
import { start as startBot } from "./bot/index.js";
import { connectDb as connectMongoDB } from "./config/index.js";

// eslint-disable-next-line @typescript-eslint/no-floating-promises

connectMongoDB();
startBot();
buildApiService();
