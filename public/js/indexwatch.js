let flvPlayer;
function streamLt() {
  let videoElement = document.getElementById("video1");
  let strLink = `wss://${url.host}/live/${strname}.flv`;

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
  }
}

document.addEventListener("DOMContentLoaded", streamLt);
