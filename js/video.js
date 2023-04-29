var console = {
  log: function (msg) {
    let debugLog = document.getElementById('debugLog');
    for (let i = 0; i < arguments.length; i++) {
      let arg = arguments[i];
      if (arg) {
        debugLog.innerText += arg + '| ' + "\r\n";
      }
    }
  },
  error: function (msg) {
    let debugLog = document.getElementById('debugLog');
    for (let i = 0; i < arguments.length; i++) {
      let arg = arguments[i];
      if (arg) {
        debugLog.innerText += arg + '| ' + "\r\n";
      }
    }
  },
  warn: function (msg) {
    let debugLog = document.getElementById('debugLog');
    for (let i = 0; i < arguments.length; i++) {
      let arg = arguments[i];
      if (arg) {
        debugLog.innerText += arg + '| ' + "\r\n";
      }
    }
  }
}

console.log('script.js version 0.1');


document.body.style.zoom = "75%"; //use when capturing video

var localStorage = window.localStorage;
var cameraSelect = document.querySelector('select#cameraSource');

function getKeyCameraId() {
  return "CAMERA_ID";
}

function getCameraStreamHandleError(error) {
  console.error('Error: ', error);
}


function getCameraDevices() {
  // AFAICT in Safari this only gets default devices until gUM is called :/
  return navigator.mediaDevices.enumerateDevices();
}


function gotCameraDevices(deviceInfos) {
  //console.log('gotCameraDevices', deviceInfos);
  { //add blank default
    const option = document.createElement('option');
    option.value = '';
    option.text = '[Select Camera]';
    option.selected = true;
    option.disabled = true;
    cameraSelect.appendChild(option);
  }
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `Camera ${cameraSelect.length + 1}`;
      cameraSelect.appendChild(option);
    }
  }
}


function gotCameraStream(stream) {
  //console.log('gotCameraStream', stream);
  cameraSelect.selectedIndex = [...cameraSelect.options].
    findIndex(option => option.text === stream.getVideoTracks()[0].label);
  video.srcObject = stream;
  if (cameraSelect.selectedIndex != -1) {
    // -1 is default stream
    localStorage.setItem(getKeyCameraId(), cameraSelect.selectedIndex);
  }
}


function getCameraStream(evt) {
  if (evt && evt.type == 'change') {
    //console.log('getCameraStream', evt, evt.type);
    localStorage.setItem(getKeyCameraId(), cameraSelect.selectedIndex);
    video.srcObject = undefined;
  }
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const cameraSource = cameraSelect.value;
  const constraints = {
    video: { deviceId: cameraSource ? { exact: cameraSource } : undefined }
  };
  return navigator.mediaDevices.getUserMedia(constraints).
    then(gotCameraStream).catch(getCameraStreamHandleError);
}

async function requestPermissions() {
  let permissionObj = await navigator.permissions.query({ name: 'camera' });
  console.log('requestPermissions:', permissionObj.state);
  if (permissionObj.state === 'granted') {
    console.log('Permission request complete!');
    return;
  }

  setTimeout(function () {
    requestPermissions();
  }, 3000);
}

async function pageLoad() {

  await requestPermissions();

  cameraSelect.onchange = getCameraStream;

  getCameraStream().then(getCameraDevices).then(gotCameraDevices).then(function () {
    let selectedCameraIndex = localStorage.getItem(getKeyCameraId());
    if (selectedCameraIndex != '') {
      cameraSelect.selectedIndex = parseInt(selectedCameraIndex, 10);
      //console.log('Select camera', cameraSelect.selectedIndex);
      getCameraStream();
    }
  });
}

pageLoad();
