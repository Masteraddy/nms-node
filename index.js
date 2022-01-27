const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;
const PORTS = process.env.PORTS || 3030;

const privateKey = fs.readFileSync(`${__dirname}/keys/key.pem`, "utf8");
const certificate = fs.readFileSync(`${__dirname}/keys/cert.pem`, "utf8");

const credentials = { key: privateKey, cert: certificate };

const staticServe = express.static(`${__dirname}/public`);

app.use("/", staticServe);
app.use("*", staticServe);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(PORT, () => console.log(`http on ${PORT}`));
httpsServer.listen(PORTS, () => console.log(`https on ${PORTS}`));
