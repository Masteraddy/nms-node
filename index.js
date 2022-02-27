const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const PORTS = process.env.PORTS || 3030;

app.use(express.json());

const recUrls = [];

const privateKey = fs.readFileSync(`${__dirname}/keys/key.pem`, "utf8");
const certificate = fs.readFileSync(`${__dirname}/keys/chain.crt`, "utf8");

const credentials = { key: privateKey, cert: certificate };

const staticServe = express.static(`${__dirname}/public`);

app.post("/notify", async (req, res) => {
  const { action, filename, name } = req.body;
  let url = `https://live.trivoh.com:8443/record/live/${name}/${filename}`;
  if (action == "doneRecord") {
    try {
      let recSaver = `https://kiind.co.uk/api/save-recording/post`;
      const body = { slug: name, recording_link: url };
      const response = await axios.post(recSaver, body);
      const data = await response.data;
      console.log(url, data);
    } catch (error) {
      console.log(url, error?.response?.data?.message, error?.response?.status);
    }
  } else {
    console.log("Still recording");
    console.log(filename);
  }
  res.json({ ok: true, url });
});

app.get("/recs", (req, res) => {
  res.status(200).json(recUrls);
});

app.use("/", staticServe);
app.use("*", staticServe);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(PORT, () => console.log(`http on ${PORT}`));
httpsServer.listen(PORTS, () => console.log(`https on ${PORTS}`));
