let flvPlayer;
function streamLt() {
  let urlinfo = new URLSearchParams(location.search);
  let strname = urlinfo.get("uid");

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
  }
}

// function fullScreen() {
//   if (videoElement.requestFullscreen) {
//     videoElement.requestFullscreen();
//   } else if (videoElement.mozRequestFullScreen) {
//     videoElement.mozRequestFullScreen();
//   } else if (videoElement.webkitRequestFullscreen) {
//     videoElement.webkitRequestFullscreen();
//   } else if (videoElement.msRequestFullscreen) {
//     videoElement.msRequestFullscreen();
//   }
// }

document.addEventListener("DOMContentLoaded", streamLt);
