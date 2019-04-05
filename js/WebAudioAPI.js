let audioCtx = null;

function initWebAPI() {
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  catch(e) {
    audioCtx = null;
    alert("このブラウザではWeb Audio APIがサポートされていません。");
  }
}

function loadSound(name, loaded){
  if (!audioCtx) { return; }
  const request = new XMLHttpRequest();
  const url = "resource/" + name;
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioCtx.decodeAudioData(
      request.response,
      function(bufferData) {
        loaded(bufferData);
      },
      function() {
        alert("音声ファイルの読み込みに失敗しました。");
      });
  }
  request.send();
}

let prevSource = null;

function playSound(buffer){
  if(buffer == null) {
    return;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  if(prevSource != null) {
    prevSource.stop();
  }
  source.start(0);
  prevSource = source;
}

function playSoundSilent() {
  const emptySource = audioCtx.createBufferSource();
  emptySource.start();
  emptySource.stop();
}
