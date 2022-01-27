let flvPlayer;
function streamLt() {
  let videoElement = document.getElementById("video1");
  let strLink = `wss://live.trivoh.com:8443/live/${strname}.flv`;

  if (strname == null) {
    alert("Stream Name Can't be Empty");
    return;
  }
  if (flvjs.isSupported()) {
    flvPlayer = flvjs.createPlayer({
      type: "flv",
      isLive: true,
      url: strLink,
    });
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();
    startReco();
  }
}

function startReco() {
  // http://xx.com/api/record/{app}/{name}
  // POST
  let recUrl = `${url}/api/record/live/${strname}`;
  let recSaver = `https://ecare.trvendors.com/api/save-recording/post`;
  postData(recUrl, "POST", {
    filepath: "./record/live",
    filename: `${strname}.mp4`,
  }).then((data) => {
    // console.log(data);
    if (data.code == 200) {
      //Get recording from here and save it to api
      let videoUrl = `${url}/record/live/${strname}.mp4`;
      postData(recSaver, "POST", {
        slug: strname,
        recording_link: videoUrl,
      }).then((data) => {
        console.log(data);
      });
      return;
    }
    setTimeout(() => {
      startReco();
    }, 5000);
  });
}

document.addEventListener("DOMContentLoaded", streamLt);
