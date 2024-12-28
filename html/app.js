let counter = 0;
let stage = "down";
let poses = null;
let capture;
let wrongFormTimer = 0;
let successTimer = 0;
let lastWrongFormTime = 0;
let currentExercise = 'bicepCurl';
const WRONG_FORM_COOLDOWN = 180;
let isDemoMode = true;
let demoAngle = 0;
let demoCanvas;
let demoCtx;
let correctSound;
let wrongSound;
let currentEmoji = "";
let emojiTimer = 0;
let audioContext;
let correctBuffer;
let wrongBuffer;
let formMistakes = 0;
let perfectReps = 0;
const REPS_TO_COMPLETE = 3;

// DOM elements
const counterElement = document.getElementById("counter");
const stageDisplay = document.getElementById("stage-display");
const angleDisplay = document.getElementById("angle-display");
const exerciseSelect = document.getElementById("exercise-select");
const exerciseInfo = document.getElementById("exercise-info");
const demoOverlay = document.getElementById('demo-overlay');
const startExerciseBtn = document.getElementById('start-exercise');
const demoInstruction = document.getElementById('demo-instruction');
const scoreOverlay = document.getElementById('score-overlay');
const perfectRepsElement = document.getElementById('perfect-reps');
const formMistakesElement = document.getElementById('form-mistakes');
const accuracyElement = document.getElementById('accuracy');
const restartButton = document.getElementById('restart-exercise');

// Setup MediaPipe Pose
const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// Process pose detection results
pose.onResults((results) => {
    poses = results;
});

// p5.js setup
function setup() {
    createCanvas(640, 480);
    
    // Setup webcam
    capture = createCapture(VIDEO);
    capture.size(640, 480);
    capture.hide();

    // Setup camera after webcam is ready
    const camera = new Camera(capture.elt, {
        onFrame: async () => {
            await pose.send({image: capture.elt});
        },
        width: 640,
        height: 480
    });
    camera.start();

    // Setup demo canvas
    demoCanvas = document.getElementById('demo-canvas');
    demoCtx = demoCanvas.getContext('2d');
    
    // Start demo animation
    showExerciseDemo(currentExercise);
}

async function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    try {
        const [correctResponse, wrongResponse] = await Promise.all([
            fetch('517755__danlucaz__game-fx-1.wav'),
            fetch('242503__gabrielaraujo__failurewrong-action.wav')
        ]);

        const [correctArrayBuffer, wrongArrayBuffer] = await Promise.all([
            correctResponse.arrayBuffer(),
            wrongResponse.arrayBuffer()
        ]);

        correctBuffer = await audioContext.decodeAudioData(correctArrayBuffer);
        wrongBuffer = await audioContext.decodeAudioData(wrongArrayBuffer);
    } catch (error) {
        console.error('Error loading sounds:', error);
    }
}

function playSound(buffer, volume = 0.3) {
    if (!audioContext || !buffer) return;
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start();
}

// Exercise configurations
const exercises = {
  bicepCurl: {
    name: "Bicep Curl",
    info: "Curl your arm up to your shoulder, keeping your upper arm still",
    checkForm: (landmarks) => {
      const shoulder = landmarks[12];
      const elbow = landmarks[14];
      const wrist = landmarks[16];
      const angle = calculateAngle(shoulder, elbow, wrist);
      
      return {
        angle,
        isTopPosition: angle < 45,
        isBottomPosition: angle > 160,
        wrongForm: stage === "down" && angle < 160 && angle > 45
      };
    }
  },
  lateralRaise: {
    name: "Lateral Raise",
    info: "Raise your arms out to the sides until they're parallel with the ground",
    checkForm: (landmarks) => {
      const shoulder = landmarks[12];
      const elbow = landmarks[14];
      const hip = landmarks[24];
      const angle = calculateAngle(hip, shoulder, elbow);
      
      return {
        angle,
        isTopPosition: angle > 85 && angle < 95,
        isBottomPosition: angle < 20,
        wrongForm: stage === "up" && angle > 20 && angle < 85
      };
    }
  },
  lunges: {
    name: "Lunges",
    info: "Step forward and lower your body until both knees are bent at 90 degrees",
    checkForm: (landmarks) => {
      const hip = landmarks[24];
      const knee = landmarks[26];
      const ankle = landmarks[28];
      const angle = calculateAngle(hip, knee, ankle);
      
      return {
        angle,
        isTopPosition: angle > 160,
        isBottomPosition: angle < 95 && angle > 85,
        wrongForm: stage === "down" && angle > 95 && angle < 160
      };
    }
  }
};

// Exercise selection handler
exerciseSelect.addEventListener('change', (e) => {
  currentExercise = e.target.value;
  resetExercise();
  exerciseInfo.textContent = exercises[currentExercise].info;
  showExerciseDemo(currentExercise);
});

// Set initial exercise info
exerciseInfo.textContent = exercises[currentExercise].info;

function draw() {
  background(0);

  push();
  translate(width, 0);
  scale(-1, 1);

  if (capture) {
    image(capture, 0, 0, width, height);
  }

  if (poses && poses.poseLandmarks) {
    drawSkeleton();

    const exercise = exercises[currentExercise];
    const form = exercise.checkForm(poses.poseLandmarks);
    
    angleDisplay.textContent = `${form.angle.toFixed(0)}°`;

    const currentTime = frameCount;
    if (form.wrongForm && currentTime - lastWrongFormTime > WRONG_FORM_COOLDOWN) {
      wrongFormTimer = 30;
      lastWrongFormTime = currentTime;
    }

    if (form.isBottomPosition && stage === "up") {
      stage = "down";
      stageDisplay.textContent = "Down";
    }
    if (form.isTopPosition && stage === "down") {
      stage = "up";
      stageDisplay.textContent = "Up";
      counter++;
      counterElement.textContent = counter;
      successTimer = 30;
    }
  }
  pop();

  // Draw feedback overlays
  drawFeedbackOverlays();
}

function drawFeedbackOverlays() {
  if (wrongFormTimer > 0) {
    push();
    fill(255, 0, 0, 100);
    noStroke();
    rect(0, 0, width, height);
    
    textSize(72);
    textAlign(CENTER, CENTER);
    text("😫", width/2, height/2);
    
    if (wrongFormTimer === 30) {
      formMistakes++;
      playSound(wrongBuffer, 0.2);
    }
    
    wrongFormTimer--;
    pop();
  }

  if (successTimer > 0) {
    push();
    fill(0, 255, 0, 100);
    noStroke();
    rect(0, 0, width, height);
    
    const successEmojis = ["💪", "🎯", "⭐", "🔥"];
    const emojiIndex = Math.floor(counter % successEmojis.length);
    
    textSize(72);
    textAlign(CENTER, CENTER);
    text(successEmojis[emojiIndex], width/2, height/2);
    
    if (successTimer === 30) {
      perfectReps++;
      playSound(correctBuffer, 0.3);
    }
    
    successTimer--;
    pop();
  }

  if (counter >= REPS_TO_COMPLETE) {
    showScoreScreen();
  }
}

function drawSkeleton() {
  stroke(33, 150, 243, 200);
  strokeWeight(3);

  connectPoints(12, 14);
  connectPoints(14, 16);

  connectPoints(11, 13);
  connectPoints(13, 15);

  connectPoints(11, 12);
  connectPoints(11, 23);
  connectPoints(12, 24);
  connectPoints(23, 24);

  connectPoints(23, 25);
  connectPoints(25, 27);
  connectPoints(24, 26);
  connectPoints(26, 28);

  for (let landmark of poses.poseLandmarks) {
    const x = landmark.x * width;
    const y = landmark.y * height;
    fill(33, 150, 243, 200);
    noStroke();
    circle(x, y, 6);
  }
}

function connectPoints(i1, i2) {
  const p1 = poses.poseLandmarks[i1];
  const p2 = poses.poseLandmarks[i2];
  line(p1.x * width, p1.y * height, p2.x * width, p2.y * height);
}

function calculateAngle(a, b, c) {
  let radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

function showExerciseDemo(exerciseType) {
    isDemoMode = true;
    demoOverlay.style.display = 'flex';
    demoInstruction.textContent = exercises[exerciseType].info;
    animateDemo();
}

function animateDemo() {
    if (!isDemoMode) return;

    // Clear demo canvas
    demoCtx.clearRect(0, 0, demoCanvas.width, demoCanvas.height);
    
    // Draw stick figure based on current exercise
    const centerX = demoCanvas.width / 2;
    const centerY = demoCanvas.height / 2;
    
    demoCtx.strokeStyle = '#2196f3';
    demoCtx.lineWidth = 3;
    
    switch(currentExercise) {
        case 'bicepCurl':
            drawBicepCurlDemo(centerX, centerY);
            break;
        case 'lateralRaise':
            drawLateralRaiseDemo(centerX, centerY);
            break;
        case 'lunges':
            drawLungesDemo(centerX, centerY);
            break;
    }

    demoAngle += 0.05;
    requestAnimationFrame(animateDemo);
}

function drawBicepCurlDemo(x, y) {
    const armAngle = (Math.sin(demoAngle) + 1) * 75; // Range 0-150 degrees
    
    // Draw body
    demoCtx.beginPath();
    demoCtx.moveTo(x, y - 40);
    demoCtx.lineTo(x, y + 40);
    demoCtx.stroke();
    
    // Draw arm
    const elbowX = x + Math.cos(Math.PI/2) * 30;
    const elbowY = y + Math.sin(Math.PI/2) * 30;
    
    const handX = elbowX + Math.cos(Math.PI/2 - armAngle * Math.PI/180) * 40;
    const handY = elbowY - Math.sin(armAngle * Math.PI/180) * 40;
    
    demoCtx.beginPath();
    demoCtx.moveTo(x, y);
    demoCtx.lineTo(elbowX, elbowY);
    demoCtx.lineTo(handX, handY);
    demoCtx.stroke();
}

function drawLateralRaiseDemo(x, y) {
    const armAngle = (Math.sin(demoAngle) + 1) * 45; // Range 0-90 degrees
    
    // Draw body
    demoCtx.beginPath();
    demoCtx.moveTo(x, y - 40);
    demoCtx.lineTo(x, y + 40);
    demoCtx.stroke();
    
    // Draw arms
    const shoulderY = y - 30;
    
    // Left arm
    const leftHandX = x - Math.cos(armAngle * Math.PI/180) * 60;
    const leftHandY = shoulderY - Math.sin(armAngle * Math.PI/180) * 60;
    
    // Right arm
    const rightHandX = x + Math.cos(armAngle * Math.PI/180) * 60;
    const rightHandY = shoulderY - Math.sin(armAngle * Math.PI/180) * 60;
    
    demoCtx.beginPath();
    demoCtx.moveTo(x - 10, shoulderY);
    demoCtx.lineTo(leftHandX, leftHandY);
    demoCtx.moveTo(x + 10, shoulderY);
    demoCtx.lineTo(rightHandX, rightHandY);
    demoCtx.stroke();
}

function drawLungesDemo(x, y) {
    const legAngle = (Math.sin(demoAngle) + 1) * 45; // Range 0-90 degrees
    
    // Draw upper body
    demoCtx.beginPath();
    demoCtx.moveTo(x, y - 60);
    demoCtx.lineTo(x, y);
    demoCtx.stroke();
    
    // Draw legs
    const hipY = y;
    const kneeX = x + Math.cos(legAngle * Math.PI/180) * 40;
    const kneeY = hipY + Math.sin(legAngle * Math.PI/180) * 40;
    const footX = kneeX + 20;
    const footY = kneeY + 30;
    
    // Back leg
    demoCtx.beginPath();
    demoCtx.moveTo(x, hipY);
    demoCtx.lineTo(x - 20, hipY + 60);
    demoCtx.stroke();
    
    // Front leg
    demoCtx.beginPath();
    demoCtx.moveTo(x, hipY);
    demoCtx.lineTo(kneeX, kneeY);
    demoCtx.lineTo(footX, footY);
    demoCtx.stroke();
}

startExerciseBtn.addEventListener('click', async () => {
    isDemoMode = false;
    demoOverlay.style.display = 'none';
    await initAudio(); // Initialize audio after user interaction
});

function showScoreScreen() {
    scoreOverlay.style.display = 'flex';
    perfectRepsElement.textContent = perfectReps;
    formMistakesElement.textContent = formMistakes;
    const accuracy = Math.round((perfectReps / formMistakes) * 10);
    accuracyElement.textContent = `${accuracy}%`;
}

function resetExercise() {
    counter = 0;
    formMistakes = 0;
    perfectReps = 0;
    stage = "down";
    counterElement.textContent = "0";
    scoreOverlay.style.display = 'none';
}

restartButton.addEventListener('click', () => {
    resetExercise();
});
