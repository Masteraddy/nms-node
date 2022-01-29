const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const PORTS = process.env.PORTS || 3030;

app.use(express.json());

const privateKey = fs.readFileSync(`${__dirname}/keys/key.pem`, "utf8");
const certificate = fs.readFileSync(`${__dirname}/keys/cert.pem`, "utf8");

const credentials = { key: privateKey, cert: certificate };

const staticServe = express.static(`${__dirname}/public`);

app.post("/notify", async (req, res) => {
  const { action, filename, name } = req.body;
  let url = `https://live.trivoh.com:8443/record/live/${name}/${filename}`;
  if (action == "doneRecord") {
    try {
      let recSaver = `https://ecare.trvendors.com/api/save-recording/post`;
      const body = { slug: name, recording_link: url };
      const response = await axios.post(recSaver, body);
      const data = await response.data;
      console.log(url, data);
    } catch (error) {
      console.log(url, error?.response?.data?.message, error?.response?.status);
    }
  }
  res.json({ ok: true, url });
});
app.use("/", staticServe);
app.use("*", staticServe);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(PORT, () => console.log(`http on ${PORT}`));
httpsServer.listen(PORTS, () => console.log(`https on ${PORTS}`));
