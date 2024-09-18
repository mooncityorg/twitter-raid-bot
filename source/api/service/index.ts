import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { PORT } from "../../config/config.js";
import routes from "../route/index.js";

export const buildApiService = () => {
	const app = express();

	// Set up Cross-Origin Resource Sharing (CORS) options
	app.use(cors());

	// Parse incoming JSON requests using body-parser
	app.use(express.json({ limit: "50mb" }));
	app.use(express.urlencoded({ limit: "50mb", extended: true }));
	app.use(bodyParser.json({ limit: "50mb" }));
	app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

	app.use("/api", routes);
	const server = http.createServer(app);

	server.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
};
