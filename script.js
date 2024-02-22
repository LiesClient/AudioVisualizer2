const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const audio = document.getElementById("song");
let actx, analyser, source, lastVolume = 0, lt = 0, maxFPS = 30, maxVolume = 0;
let res = 512;
// let fpsPrev = [];
// let volPrev = [];

const button = document.getElementById("play");

const width = window.innerWidth;
const height = window.innerHeight;
const maxZ = Math.sqrt((width * 1) ** 2 + (height / 2) ** 2);
const PHI = Math.PI * (Math.sqrt(5) - 1);

let xRot = 0;
let yRot = 0;
let zRot = 0;
// let currentFPS = 0;
// let textHeight = 24;

let bottomLeftCube = new Cube(
  { x: width * 0.25, y: -height / 18 }, // panel 1
  { x: width * 0.25, y: height / 3 },
  { x: width * 0.75, y: -height / 18 }, // panel 2
  { x: width * 0.75, y: height / 3 },
  1, // panel 1 foreground
  1 + ((width / 2 + 4 * (height / 18)) / maxZ), // panel 2 foregroubd
  1 + ((width / 3) / maxZ) * 6 // background,
);

bottomLeftCube.setVanishingPoint(0, 2 * height / 3 - height / 18);

let topLeftCube = new Cube(
  { x: width * 0.25, y: height / 18 }, // panel 1
  { x: width * 0.25, y: -height / 3 },
  { x: width * 0.75, y: height / 18 }, // panel 2
  { x: width * 0.75, y: -height / 3 },
  1, // panel 1 foreground
  1 + ((width / 2 + 4 * (height / 18)) / maxZ), // panel 2 foregroubd
  1 + ((width / 3) / maxZ) * 6 // background,
);

topLeftCube.setVanishingPoint(0, height - (2 * height / 3 - height / 18));

let topRightCube = new Cube(
  { x: width * 0.25, y: height / 18 }, // panel 1
  { x: width * 0.25, y: -height / 3 },
  { x: width * 0.75, y: height / 18 }, // panel 2
  { x: width * 0.75, y: -height / 3 },
  1, // panel 1 foreground
  1 + ((width / 2 + 4 * (height / 18)) / maxZ), // panel 2 foregroubd
  1 + ((width / 3) / maxZ) * 6 // background,
);

topRightCube.setVanishingPoint(width / 2, height - (2 * height / 3 - height / 18));


let bottomRightCube = new Cube(
  { x: width * 0.25, y: -height / 18 }, // panel 1
  { x: width * 0.25, y: height / 3 },
  { x: width * 0.75, y: -height / 18 }, // panel 2
  { x: width * 0.75, y: height / 3 },
  1, // panel 1 foreground
  1 + ((width / 2 + 4 * (height / 18)) / maxZ), // panel 2 foregroubd
  1 + ((width / 3) / maxZ) * 6 // background,
);

bottomRightCube.setVanishingPoint(width / 2, 2 * height / 3 - height / 18);


let panels = [
  ...bottomLeftCube.getPanels(),
  ...topLeftCube.getPanels(),
  ...bottomRightCube.getPanels(),
  ...topRightCube.getPanels()
]

let currentOffset = 0;
let currentVelocity = 4;

function init() {
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  panels.forEach(panel => panel.strokeRect(0, 0, 1, 1));
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  // ctx.font = `${textHeight}px monospace`;
  // ctx.textBaseline = "top";
  // bottomLeftCube.getPanels().forEach(panel => panel.strokeRect(0, 0.5, 1, 0));
}

function loop(replay) {
  let time = performance.now();
  let dt = time - lt;
  let fps = 1000 / dt;
  lt = time;

  // xRot += 0.2 * (dt / 1000) * Math.PI;
  yRot += 0.1 * (dt / 1000) * Math.PI;
  zRot += 0.2 * (dt / 1000) * Math.PI;  
  

  // currentFPS = lerp(currentFPS, fps, 0.5);

  // currentOffset += (dt / 1000) / 10;

  // if (currentFPS > maxFPS && currentFPS < 500) maxFPS = Math.round(fps);

  if (audio.paused) {
    button.textContent = "Play";
  }

  ctx.clearRect(-width, -height, width * 3, height * 3);

  ctx.fillStyle = "black";
  ctx.fillRect(-width, -height, width * 3, height * 3);

  let dataArray = new Uint8Array(analyser.frequencyBinCount);
  let volume = 0;
  let x = 0;
  let y = 0;

  analyser.getByteTimeDomainData(dataArray);

  let totalMagnitude = 0;

  for (let i = 0; i < dataArray.length; i++) {
    let x = (dataArray[i] / 128) - 1;
    totalMagnitude += x * x;
  }

  volume = Math.sqrt(totalMagnitude / dataArray.length);
  let volumeChange = (volume - lastVolume) * 1000;

  if (volumeChange > 0) volume += volumeChange;

  if (volume > maxVolume) maxVolume = volume;

  currentVelocity -= currentVelocity * 0.25;
  currentVelocity += (volume * 50) / dataArray.length + 2;

  let direction = Math.random() * 2 * Math.PI;
  let scale = (currentVelocity ** 2) / 256;
  x = Math.cos(direction) * scale;
  y = Math.sin(direction) * scale;

  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  // screen shake
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = "rgba(255, 255, 255, 1)";
  ctx.fillStyle = "rgba(255, 255, 255, 1)";

  {
    for (let i = 0; i < dataArray.length; i++) {
      let y = ((i / (dataArray.length - 1) + (yRot / Math.PI)) % 1) * 2 - 1;
      let r = Math.sqrt(1 - y * y);
      let t = PHI * i;
      let x = Math.cos(t + xRot) * r;
      let z = Math.sin(t + zRot) * r;
      let scale = (dataArray[i] / 128 - 1) * 0.5 + 0.5; // (-1, 1) -> (-.5, 0.5) -> (0, 1)
      let zF = z * scale * 0.5 + 0.5;
      let translated = bottomRightCube.translatePoint(x * scale * 0.5 + 0.5, y * 0.5 + 0.5, zF);
      let s = 3 * zF + 1;

      ctx.fillRect(translated.x - s / 2, translated.y - s / 2, s, s);
    }
  }

  {
    let getPoint = (i) => ({
      x: (i / dataArray.length) % 1,
      y: (dataArray[i] / 128 - 1) * (1 - Math.abs(i - dataArray.length / 2) / (dataArray.length / 2)) * 0.5 + 0.5
    });

    for (let i = 0; i < dataArray.length; i++) {
      let q0 = getPoint(i);
      let q1 = getPoint(i ? i - 1 : dataArray.length - 1);
      let b = Math.abs(dataArray[i] / 128) / 10;

      if (Math.abs(q0.x - q1.x) > 0.5) continue;

      let p0 = bottomLeftCube.translatePoint(q0.x, q0.y, 0);
      let p1 = bottomLeftCube.translatePoint(q1.x, q1.y, 0);

      let p2 = bottomLeftCube.translatePoint(0.5, 0.5, 1);
      let p3 = bottomLeftCube.translatePoint(0.5, 0.5, 1);

      ctx.fillStyle = `rgba(255, 255, 255, ${b})`;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.fill();
    }
  }

  analyser.getByteFrequencyData(dataArray);

  {
    let getPoint = (i) => ({
      x: (i / dataArray.length) % 1,
      y: (dataArray[i] / 255)
    });

    ctx.fillStyle = `rgba(255, 255, 255, 0.01)`;
    ctx.strokeStyle = `rgba(255, 255, 255, 0.25)`;

    for (let i = 0; i < dataArray.length; i++) {
      let q0 = getPoint(i);
      let q1 = getPoint(i ? i - 1 : dataArray.length - 1);

      if (Math.abs(q0.x - q1.x) > 0.5) continue;

      // topLeftCube.fillCube(q0.x, 0, 0, Math.abs(q0.x - q1.x), q0.y, 1);
      topLeftCube.panel0.strokeRect(q0.x, 0, Math.abs(q0.x - q1.x), q0.y);

      let p0 = topLeftCube.translatePoint(q0.x, q0.y, 0);
      let p1 = topLeftCube.translatePoint(q0.x, q0.y, 1);
      let p2 = topLeftCube.translatePoint(q0.x, 0, 1);
      let p3 = topLeftCube.translatePoint(q0.x, 0, 0);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p0.x, p0.y);
      ctx.fill();
      ctx.stroke();
    }
  }

  let center = topRightCube.translatePoint(0.5, 0.5, 1);
  let lastX = -420;
  let lastY = -69;
  ctx.strokeStyle = "white";

  for (let i = dataArray.length - 1; i >= 0; i--) {
    let ang = (i / dataArray.length) * 12 * Math.PI;
    let mag = (dataArray[i] / 255);
    let x = Math.sin(ang) * mag * 0.5 + 0.5;
    let y = -Math.cos(ang) * mag * 0.5 + 0.5;

    let point = topRightCube.translatePoint(x, y, 0);

    x = point.x;
    y = point.y;

    if (lastX == -420 && lastY == -69) {
      lastX = center.x;
      lastY = center.y;
    }

    let brightness = 255 * ((i / dataArray.length));
    ctx.globalAlpha = brightness / 255;
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 1)`;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.lineTo(center.x, center.y);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  ctx.fillStyle = "white";

  ctx.globalAlpha = 1;
  panels.forEach(panel => panel.strokeRect(0, 0, 1, 1));
  bottomLeftCube.panel1.strokeRect(0, 0.5, 1, 0);
  bottomLeftCube.panel1.strokeRect(0.5, 0, 0.5, 1);
  topRightCube.panel1.strokeRect(0, 0.5, 1, 0);
  topRightCube.panel1.strokeRect(0.5, 0, 0.5, 1);

  ctx.restore();

  ctx.fillStyle = "white";

  // let leftPad = (str, mNum) => {
  //   if(str.length >= mNum) return str;
  //   return leftPad(" " + str, mNum);
  // }

  // let padAmount = 8;
  // let volStr = "Volume: " + leftPad((volume * 10).toFixed(2).toString(), padAmount);

  // ctx.fillText("FPS: " + leftPad(currentFPS.toFixed(2).toString(), padAmount + 3), width / 2 + textHeight / 2, height / 2 + textHeight / 2);
  // ctx.fillText(volStr, width / 2 + textHeight + (width / 2 - textHeight * 1.5) / 2, height / 2 + textHeight / 2);

  // ctx.strokeRect(width / 2 + textHeight / 2, height / 2 + textHeight * 2, (width / 2 - textHeight * 1.5) / 2, height / 2 - textHeight * 2.5);
  // ctx.strokeRect(width / 2 + textHeight + (width / 2 - textHeight * 1.5) / 2, height / 2 + textHeight * 2, (width / 2 - textHeight * 1.5) / 2, height / 2 - textHeight * 2.5);

  // let max_fps = Math.max(...fpsPrev);
  // let max_vol = Math.max(...volPrev);

  // ctx.beginPath();
  // for (let i = 0; i < fpsPrev.length; i++) {
  //   let x = width / 2 + textHeight / 2 + (i / fpsPrev.length) * (width / 2 - textHeight * 1.5) / 2
  //   let y = height / 2 + textHeight * 2 + (1 - fpsPrev[i] / max_fps) * (height / 2 - textHeight * 2.5);
  //   ctx.lineTo(x, y);
  // }
  // ctx.stroke();

  // ctx.beginPath();
  // for (let i = 0; i < volPrev.length; i++) {
  //   let x = width / 2 + textHeight + (width / 2 - textHeight * 1.5) / 2 + (i / fpsPrev.length) * (width / 2 - textHeight * 1.5) / 2
  //   let y = height / 2 + textHeight * 2 + (1 - volPrev[i] / max_vol) * (height / 2 - textHeight * 2.5);
  //   ctx.lineTo(x, y);
  // }
  // ctx.stroke();

  // fpsPrev.push(currentFPS);
  // volPrev.push(volume);

  // if (fpsPrev.length > Math.ceil((width / 2 - textHeight * 1.5) / 2)) fpsPrev.shift();
  // if (volPrev.length > Math.ceil((width / 2 - textHeight * 1.5) / 2)) volPrev.shift();

  lastVolume = volume;

  requestAnimationFrame(() => {
    try { loop(); } catch (e) { document.write(e); }
  });
}

button.onclick = () => {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = actx.createAnalyser();
    source = actx.createMediaElementSource(audio);

    source.connect(analyser);
    source.connect(actx.destination);
    analyser.fftSize = res;

    try { loop(); } catch (e) { document.write(e); }
  }

  if (audio.paused) {
    audio.play();
    button.textContent = "Stop";
  } else {
    audio.pause();
    button.textContent = "Play";
  }
};

init();
