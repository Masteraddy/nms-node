/** @format */

var nmRTC = (function () {
  "use strict";
  class a {
    on(a, b, c) {
      const d = this.e || (this.e = {});
      return (d[a] || (d[a] = [])).push({ fn: b, ctx: c }), this;
    }
    once(a, b, c) {
      function d(...f) {
        e.off(a, d), b.apply(c, f);
      }
      const e = this;
      return (d._ = b), this.on(a, d, c);
    }
    emit(a, ...b) {
      const c = ((this.e || (this.e = {}))[a] || []).slice();
      for (let d = 0; d < c.length; d += 1) c[d].fn.apply(c[d].ctx, b);
      return this;
    }
    off(a, b) {
      const c = this.e || (this.e = {}),
        d = c[a],
        e = [];
      if (d && b)
        for (let a = 0, c = d.length; a < c; a += 1)
          d[a].fn !== b && d[a].fn._ !== b && e.push(d[a]);
      return e.length ? (c[a] = e) : delete c[a], this;
    }
  }
  return {
    Publisher: class extends a {
      constructor(a) {
        super(),
          (this.id = a.id),
          (this.stun = a.stun),
          (this.stunMaxTime = a.stunMaxTime || 2e3),
          (this.video = a.video),
          (this.audio = a.audio),
          (this.videoElement = document.getElementById(this.id)),
          (this.pc = null),
          (this.ws = null),
          navigator.mediaDevices
            .getUserMedia(a)
            .then(this.gotStream.bind(this))
            .catch(this.handleError.bind(this)),
          (this.toggleAudio = this.toggleAudio.bind(this)),
          (this.toggleVideo = this.toggleVideo.bind(this));
      }
      gotStream(a) {
        (this.videoElement.srcObject = a), (this.stream = a);
      }
      handleError(a) {
        this.emit("error", a);
      }
      createPC() {
        return new Promise((a, b) => {
          if (null != this.pc) b(!1);
          else {
            let b = new RTCPeerConnection({ iceServers: this.stun }),
              c = setTimeout(() => {
                a(!0);
              }, this.stunMaxTime);
            this.stream.getTracks().forEach((a) => {
              b.addTrack(a, this.stream);
            }),
              b
                .createOffer()
                .then((a) => {
                  b.setLocalDescription(a);
                })
                .catch(this.handleError.bind(this)),
              (b.oniceconnectionstatechange = () => {
                console.log("ice connection state changed");
              }),
              (b.onicecandidate = (b) => {
                null === b.candidate && (clearTimeout(c), a(!0));
              }),
              (this.pc = b);
          }
        });
      }
      createWS(a) {
        return new Promise((b, c) => {
          if (null != this.ws) c(!1);
          else {
            let c = new WebSocket(a);
            (c.onopen = () => {
              console.log("websocket open"),
                c.send(
                  btoa(
                    JSON.stringify({
                      method: "publish",
                      audio: this.audio,
                      video: this.video,
                      description: this.pc.localDescription,
                    })
                  )
                );
            }),
              (c.onmessage = (a) => {
                let c = JSON.parse(atob(a.data));
                "onpublish" === c.method
                  ? (this.pc.setRemoteDescription(new RTCSessionDescription(c.description)), b(!0))
                  : "onerror" === c.method && (console.error(c.error), this.stop());
              }),
              (c.onclose = () => {
                console.log("websocket closed");
              }),
              (this.ws = c);
          }
        });
      }
      async start(a) {
        let b = await this.createPC();
        (b = await this.createWS(a)), b && this.emit("start");
      }
      stop() {
        this.ws && (this.ws.close(), (this.ws = null)),
          this.pc && (this.pc.close(), (this.pc = null)),
          this.emit("stop");
      }

      toggleAudio(cb) {
        this.stream.getTracks().forEach(function (track) {
          if (track.kind === "audio") {
            const newState = !track.enabled;
            track.enabled = newState;
            cb(track.enabled);
          }
        });
      }

      toggleVideo(cb) {
        this.stream.getTracks().forEach(function (track) {
          if (track.kind === "video") {
            const newState = !track.enabled;
            track.enabled = newState;
            cb(track.enabled);
          }
        });
      }
    },
  };
})();
