let channelId = 164;

const echo = new Echo({
  broadcaster: "pusher",
  key: "kiind",
  wsHost: "51.140.155.4",
  wsPort: 6001,
  disableStats: true,
  encrypted: false,
  forceTLS: false,
});

// echo.channel(`live.stream.${channelId}`).listenAll((e) => console.log(e));
echo.channel(`live.stream.${channelId}`).listen(".Comment", (e) => writeComment(v));
echo.channel(`live.stream.${channelId}`).listen(".Like", (e) => changeLike(e.post.likes));
echo.channel(`live.stream.${channelId}`).listen(".Dislike", (e) => console.log(e));

fetch(`https://kiind.co.uk/api/guest/post/${channelId}`)
  .then((res) => res.json())
  .then((data) => {
    const comments = data.data.comments;
    changeLike(data.data.likes);
    comments.forEach((v, i) => writeComment(v));
  })
  .catch(console.error);

function writeComment(comment) {
  let outDiv = document.createElement("div");
  let messages = document.getElementById("comments");
  outDiv.className = "flex mb-2";
  let date = new Date(comment.created_at);
  let newComment = `
    <img
      src="${comment.user.avatar}"
      alt=""
      class="w-10 h-10 rounded-full"
    />
    <div class="rounded-lg bg-trigreen p-1 w-full divide-y divide-green-700">
      <p class="text-xs text-green-900 capitalize pb-2">
        ${comment.user.name}
        <br /><span class="w-full italic">${date.toLocaleDateString()}: ${date.toLocaleTimeString()}</span>
      </p>
      <div class="text-sm p-1">
        ${comment.body}
      </div>
    </div>`;
  outDiv.innerHTML = newComment;
  messages.append(outDiv);
  messages.scrollTop = messages.scrollHeight;
}

function changeLike(likes) {
  document.getElementById("like-count").innerHTML = likes;
}
