let startBtn = $("#start-btn");
let camBtn = $("#cam-btn");
let micBtn = $("#mic-btn");
let settingBtn = $("#settingbtn");
let streamRTMP = $("#streamurl");
let watchLink = $("#watchlink");
let streamKey = $("#streamkey");
const strname = uuid.v4();
// const strname = "fb15dae1-f00b-4dbe-8be3-db84a307fca2";
const url = `https://live.trivoh.com:8443`;
const rtmpLink = `rtmp://live.trivoh.com/live`;
const strLink = `${location.origin}/watch.html?uid=${strname}`;
let countTimeout;
let publiser;

let autoRecord = false;

watchLink.value = strLink;
// watchLink1.value = strLink;

if (location.pathname == "/stream.html") {
  streamRTMP.value = rtmpLink;
  streamKey.value = strname;
}
if (location.pathname == "/" || location.pathname == "/index.html") {
  camBtn.addEventListener("click", toggleVideo);
  micBtn.addEventListener("click", toggleAudio);
  startBtn.addEventListener("click", function (e) {
    let isStopBtn = $("#start-btn").className.includes("deactive");
    if (isStopBtn) {
      stop();
      return;
    }
    start();
  });

  init();
}
settingBtn.addEventListener("click", init);
function init() {
  let audioDoc = $("select#audio");
  let videoDoc = $("select#video");
  const audioSource = audioDoc.value;
  const videoSource = videoDoc.value;

  publiser = new nmRTC.Publisher({
    id: "webcamvideo",
    stun: [
      {
        urls: "stun:stun.nodemedia.cn:3478",
      },
    ],
    stunMaxTime: 1000,
    video: {
      deviceId: videoSource ? { exact: videoSource } : undefined,
      width: 1280,
      height: 720,
      bitrate: 1500 * 1000,
      keyInterval: 2,
    },
    audio: {
      bitrate: 64 * 1000,
      deviceId: audioSource ? { exact: audioSource } : undefined,
    },
  });

  publiser.on("start", () => {
    $(".status").classList.remove("hidden");
    $("#start-btn").classList.add("deactive");
    if (autoRecord === true) {
      startRec();
    }
  });
  publiser.on("stop", () => {
    $(".status").classList.add("hidden");
    $("#start-btn").classList.remove("deactive");
    clearInterval(countTimeout);
  });
  publiser.on("error", (error) => {
    $(".status").classList.add("hidden");
    clearInterval(countTimeout);
    console.log("NMRTC Publisher on error", error);
  });
  $("#setting").classList.add("hidden");
}
function start() {
  if (strname !== "") {
    let rtcLink = `wss://live.trivoh.com:8443/live/${strname}.rtc`;
    publiser.start(rtcLink);
    countTimeout = setInterval(() => {
      getViews(strname, "#live-count");
    }, 5000);
    return;
  }
  alert("Name Cant be empty");
}

function stop() {
  clearInterval(countTimeout);
  publiser.stop();
}
function toggleAudio() {
  publiser.toggleAudio((s) => {
    if (s === false) {
      $("#mic-btn").classList.add("deactive");
      return;
    }
    $("#mic-btn").classList.remove("deactive");
  });
}

function toggleVideo() {
  publiser.toggleVideo((s) => {
    if (s === false) {
      $("#cam-btn").classList.add("deactive");
      return;
    }
    $("#cam-btn").classList.remove("deactive");
  });
}

function startRec() {
  // http://xx.com/api/record/{app}/{name}
  // POST
  let count = randomString(5);
  let recUrl = `${url}/api/record/live/${strname}`;
  let recSaver = `https://ecare.trvendors.com/api/save-recording/post`;
  postData(recUrl, "POST", {
    filepath: "./record/live",
    filename: `${strname}-${count}.mp4`,
  }).then((data) => {
    // console.log(data);
    if (data.code == 200) {
      //Get recording from here and save it to api
      let videoUrl = `${url}/record/live/${strname}-${count}.mp4`;
      postData(recSaver, "POST", {
        slug: strname,
        recording_link: videoUrl,
      }).then((data) => {
        console.log(data);
      });
      return;
    }
    alert(data.error);
  });
}

function getViews(name, id) {
  let countEl = $(id);
  let streamAPI = `${url}/api/streams/live/${name}`;
  fetch(streamAPI)
    .then((res) => res.json())
    .then((dt) => (countEl.innerHTML = dt?.data?.live[name]?.subcount || 0))
    .catch((err) => console.error(err));
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function gotDevices(deviceInfos) {
  const masterInputSelector = document.createElement("select");
  masterInputSelector.classList.add("input-select");
  masterInputSelector.id = "audio";

  const videoInputSelector = document.createElement("select");
  videoInputSelector.classList.add("input-select");
  videoInputSelector.id = "video";

  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement("option");
    const vidoption = document.createElement("option");
    option.value = deviceInfo.deviceId;
    vidoption.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `Mic ${masterInputSelector.length + 1}`;
      masterInputSelector.appendChild(option);
    }
    if (deviceInfo.kind === "videoinput") {
      vidoption.text = deviceInfo.label || `Cam ${videoInputSelector.length + 1}`;
      videoInputSelector.appendChild(vidoption);
    }
  }
  const audioSelectors = $("select#audio");
  const videoSelectors = $("select#video");
  const newAudioSelector = masterInputSelector.cloneNode(true);
  audioSelectors.parentNode.replaceChild(newAudioSelector, audioSelectors);

  const newVideoSelector = videoInputSelector.cloneNode(true);
  videoSelectors.parentNode.replaceChild(newVideoSelector, videoSelectors);
}
function handleError(error) {
  console.log("navigator.MediaDevices.getUserMedia error: ", error.message, error.name);
}
