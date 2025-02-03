// State variables
let poses = null;
let capture;
let counter = 0;
let wrongFormTimer = 0;
let lastWrongFormTime = 0;
let wrongFormCooldownTimer = 0;
let formMistakes = 0;
let perfectReps = 0;
let lastPerfectReps = 0;
let totalReps = 0;
let currentSet = 1;
let repsInCurrentSet = 0;
let isTrackingEnabled = true;

// Exercise thresholds and constants
const WRONG_FORM_COOLDOWN = 1000;
const DOWN_ANGLE_THRESHOLD = 130;
const UP_ANGLE_THRESHOLD = 70;
const CONSECUTIVE_MISTAKE_THRESHOLD = 3;
const MISTAKE_RESET_TIME = 3000;
const MIN_REP_DURATION = 600;
const START_ANGLE_MIN = 15;
const START_ANGLE_MAX = 80;
const END_ANGLE_MIN = 115;
const END_ANGLE_MAX = 165;
const ANGLE_THRESHOLD = 8;
const ALIGNMENT_THRESHOLD = 50;
const SIDE_VIEW_SHOULDER_THRESHOLD = 0.15;
const RED_OVERLAY_DURATION = 500;
const ERROR_MESSAGE_DURATION = 3000;
const SUCCESS_ANIMATION_DURATION = 2000;
const MIN_ANGLE_CHANGE_FOR_REP = 80;
const MIN_REP_DURATION_SECONDS = 700;

const VALID_START_MIN = 20;
const VALID_START_MAX = 40;
const VALID_END_MIN = 100;
const VALID_END_MAX = 140;
const SVG_ICONS = {
  success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#4CAF50"/>
  </svg>`,
  warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill="#FFC107"/>
  </svg>`,
  error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM17 15.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12L17 15.59Z" fill="#F44336"/>
  </svg>`,
  info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#2196F3"/>
  </svg>`,
};

// Exercise tracking variables
let successAnimations = [];
let consecutiveFormMistakes = 0;
let lastMistakeTime = 0;
let isRepInProgress = false;
let hasFormMistakeInCurrentRep = false;
let startingAngle = 0;
let maxAngleInRep = 0;
let didReachEndAngle = false;
let repStartTime = 0;
let isInSideView = false;
let redOverlayStartTime = 0;
let currentErrorMessage = "";
let errorMessageStartTime = 0;
let isShowingSuccessAnimation = false;
let currentSide = "right";

// Exercise default configuration change to 12 reps and 3 sets for public release
let targetReps = 100;
let targetSets = 100;

let errorStats = {
  incompleteRange: 0,
  tooFastReps: 0,
  misalignedArm: 0,
  wrongStartAngle: 0,
  wrongEndAngle: 0,
};

let mostCommonError = "none";
// UI elements
const repProgressBar = document.getElementById("rep-progress");
const setProgressBar = document.getElementById("set-progress");
const feedbackContainer = document.getElementById("feedbackContainer");
const currentSetNumber = document.getElementById("currentSetNumber");
const formFeedback = document.getElementById("formFeedback");
const nextSetButton = document.getElementById("nextSetButton");

// Feedback messages
const TOO_FAST_MESSAGE = "You are going too fast, exercise a bit slower!";
const SIDE_VIEW_MESSAGE = "Please turn to your side for better tracking";
const RANGE_INSTRUCTION = `Required motion: Start (${START_ANGLE_MIN}°-${START_ANGLE_MAX}°) &#8594; End (${END_ANGLE_MIN}°-${END_ANGLE_MAX}°)`;
const INCOMPLETE_REP_MESSAGE = "Incomplete rep! Complete full range of motion";

function handleMessage(event) {
  console.log("Received message:", event.data);

  try {
    const data =
      typeof event.data === "string" ? JSON.parse(event.data) : event.data;

    if (data.type === "exerciseConfig") {
      targetReps = data.reps || targetReps;
      targetSets = data.sets || targetSets;
      console.log(`Updated config: ${targetReps} reps, ${targetSets} sets`);
    } else if (data.type === "requestCurrentStats") {
      const currentStats = {
        type: "earlyCompletion",
        stats: {
          totalReps: counter,
          perfectReps: perfectReps,
          formMistakes: formMistakes,
          completedSets: currentSet,
          currentSetReps: repsInCurrentSet,
        },
      };

      // Send stats back to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(currentStats));
      } else {
        window.postMessage(currentStats, "*");
      }
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
}

window.addEventListener("message", handleMessage);

// Function to get current stats and end exercise early
function finishExerciseEarly() {
  const formAccuracy =
    counter > 0 ? Math.round((perfectReps / counter) * 100) : 0;
  const totalErrors = Object.values(errorStats).reduce((a, b) => a + b, 0);
  const mostCommonErrorType = Object.entries(errorStats).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  const errorMessages = {
    incompleteRange: "Incomplete range of motion",
    tooFastReps: "Exercises performed too quickly",
    misalignedArm: "Arm not properly aligned",
    wrongStartAngle: "Incorrect starting position",
    wrongEndAngle: "Incorrect ending position",
  };

  const stats = {
    type: "exerciseComplete",
    stats: {
      totalReps: counter,
      perfectReps: perfectReps,
      wrongReps: counter - perfectReps,
      formAccuracy: formAccuracy,
      totalErrors: totalErrors,
      formMistakes: {
        incompleteRange: errorStats.incompleteRange,
        tooFastReps: errorStats.tooFastReps,
        misalignedArm: errorStats.misalignedArm,
        wrongStartAngle: errorStats.wrongStartAngle,
        wrongEndAngle: errorStats.wrongEndAngle,
      },
      completedSets: currentSet,
      mostCommonError: mostCommonErrorType,
      mostCommonErrorMessage:
        errorMessages[mostCommonErrorType] || "No major errors",
    },
  };

  console.log("Sending exercise stats:", stats);

  // Send to React Native
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(stats));
  } else {
    window.postMessage(stats, "*");
  }
}

// Make the function globally accessible
window.finishExerciseEarly = finishExerciseEarly;

// Setup MediaPipe Pose with enhanced settings
const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});

pose.setOptions({
  modelComplexity: 2,
  smoothLandmarks: false,
  minDetectionConfidence: 0.65,
  minTrackingConfidence: 0.65,
  enableFaceGeometry: false,
});

let leftArmStage = "down";
let rightArmStage = "down";
let lastLeftAngle = 0;
let lastRightAngle = 0;
let lastRepTime = 0;
const REP_HISTORY_SIZE = 3;
let leftAngleHistory = Array(REP_HISTORY_SIZE).fill(0);
let rightAngleHistory = Array(REP_HISTORY_SIZE).fill(0);

class SuccessAnimation {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.initialY = y;
    this.opacity = 255;
    this.startTime = Date.now();
    this.duration = 2000;
    this.size = 256;
  }

  update() {
    const elapsed = Date.now() - this.startTime;
    const progress = elapsed / this.duration;

    const totalDistance = this.initialY;
    this.y = this.initialY - totalDistance * progress;

    this.opacity = 255 * (1 - progress);

    return elapsed < this.duration;
  }

  draw() {
    push();
    textAlign(CENTER, CENTER);
    textSize(this.size);
    strokeWeight(4);
    stroke(0, this.opacity * 0.6);
    fill(0, 255, 0, this.opacity);
    text("+", this.x, this.y);
    noStroke();
    fill(0, 255, 0, this.opacity);
    text("+", this.x, this.y);
    pop();
  }
}

pose.onResults((results) => {
  poses = results;
});

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.style("display", "block");
  frameRate(60);

  capture = createCapture(VIDEO, {
    width: 640,
    height: 480,
  });
  capture.hide();

  const camera = new Camera(capture.elt, {
    onFrame: async () => {
      await pose.send({ image: capture.elt });
    },
    width: 640,
    height: 480,
  });
  camera.start();
}

function draw() {
  background(0);

  const videoAspectRatio = capture.width / capture.height;
  const canvasAspectRatio = width / height;

  let scaledWidth, scaledHeight;

  if (videoAspectRatio > canvasAspectRatio) {
    scaledWidth = height * videoAspectRatio;
    scaledHeight = height;
  } else {
    scaledWidth = width;
    scaledHeight = width / videoAspectRatio;
  }

  push();
  translate(width, 0);
  scale(-1, 1);

  if (!isTrackingEnabled) {
    image(
      capture,
      (width - scaledWidth) / 2,
      (height - scaledHeight) / 2,
      scaledWidth,
      scaledHeight
    );
    pop();

    fill(0, 0, 0, 150);
    noStroke();
    rect(0, 0, width, height);
    return;
  }

  image(
    capture,
    (width - scaledWidth) / 2,
    (height - scaledHeight) / 2,
    scaledWidth,
    scaledHeight
  );
  pop();

  if (poses && poses.poseLandmarks && isTrackingEnabled) {
    drawSkeleton();
    if (checkViewPosition()) {
      checkBicepCurl();
    } else {
      // Display message to turn to side
      push();
      fill(255);
      textSize(16);
      textAlign(CENTER, CENTER);
      text(SIDE_VIEW_MESSAGE, width / 2, height / 2);
      pop();
    }
  }

  drawErrorMessages();
  drawFeedbackOverlays();

  // Update and draw success animations
  for (let i = successAnimations.length - 1; i >= 0; i--) {
    const animation = successAnimations[i];
    animation.update();
    animation.draw();
    if (animation.opacity <= 0) {
      successAnimations.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function checkViewPosition() {
  if (!poses || !poses.poseLandmarks) return false;

  const leftShoulder = poses.poseLandmarks[11];
  const rightShoulder = poses.poseLandmarks[12];
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

  currentSide = leftShoulder.z < rightShoulder.z ? "left" : "right";
  isInSideView = shoulderWidth < SIDE_VIEW_SHOULDER_THRESHOLD;

  return isInSideView;
}

function checkBicepCurl() {
  const shoulderIndex = currentSide === "left" ? 11 : 12;
  const elbowIndex = currentSide === "left" ? 13 : 14;
  const wristIndex = currentSide === "left" ? 15 : 16;
  const hipIndex = currentSide === "left" ? 23 : 24;

  const shoulder = poses.poseLandmarks[shoulderIndex];
  const elbow = poses.poseLandmarks[elbowIndex];
  const wrist = poses.poseLandmarks[wristIndex];
  const hip = poses.poseLandmarks[hipIndex];

  const curlAngle = calculateAngle(shoulder, elbow, wrist);

  const angleHistory =
    currentSide === "left" ? leftAngleHistory : rightAngleHistory;
  if (currentSide === "left") {
    leftAngleHistory = [...leftAngleHistory.slice(1), curlAngle];
  } else {
    rightAngleHistory = [...rightAngleHistory.slice(1), curlAngle];
  }

  const smoothedAngle =
    angleHistory.reduce((a, b) => a + b) / angleHistory.length;
  const armAlignment = calculateArmAlignment(shoulder, elbow, hip);

  checkArmMovement(
    smoothedAngle,
    armAlignment,
    currentSide,
    currentSide === "left" ? leftArmStage : rightArmStage,
    (stage) => {
      if (currentSide === "left") {
        leftArmStage = stage;
      } else {
        rightArmStage = stage;
      }
    }
  );
}

function checkArmMovement(angle, alignment, side, currentStage, setStage) {
  // Display angle in the middle of the screen
  if (side === "left") {
    push();
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(`Angle: ${angle.toFixed(1)}°`, width / 2, height / 2);
    pop();
  }

  const angleChange = Math.abs(
    angle - (side === "left" ? lastLeftAngle : lastRightAngle)
  );

  if (angleChange > ANGLE_THRESHOLD && isInSideView) {
    if (
      !isRepInProgress &&
      angle >= VALID_START_MIN &&
      angle <= VALID_START_MAX
    ) {
      isRepInProgress = true;
      hasFormMistakeInCurrentRep = false;
      maxAngleInRep = angle;
      repStartTime = Date.now();
      startingAngle = angle;
      console.log("Starting rep at angle:", angle);
    }

    if (isRepInProgress) {
      maxAngleInRep = Math.max(maxAngleInRep, angle);
      const isArmMisaligned = Math.abs(alignment) > ALIGNMENT_THRESHOLD;
      if (isArmMisaligned) {
        hasFormMistakeInCurrentRep = true;
        errorStats.misalignedArm++;
        showErrorIcon("misaligned");
        redOverlayStartTime = Date.now();
      }

      if (angle <= VALID_START_MAX && maxAngleInRep > VALID_START_MAX) {
        const now = Date.now();
        const repDuration = now - repStartTime;

        // Always count the rep
        counter++;
        repsInCurrentSet++;
        console.log("Completed rep:", counter, "Max angle:", maxAngleInRep);

        // Check for mistakes
        if (repDuration < MIN_REP_DURATION) {
          errorStats.tooFastReps++;
          showErrorIcon("tooFast");
          hasFormMistakeInCurrentRep = true;
          redOverlayStartTime = Date.now();
        }

        if (maxAngleInRep < VALID_END_MIN) {
          errorStats.incompleteRange++;
          showErrorIcon("incompleteRange");
          hasFormMistakeInCurrentRep = true;
          redOverlayStartTime = Date.now();
        }
        if (!hasFormMistakeInCurrentRep) {
          perfectReps++;
          successAnimations.push(new SuccessAnimation(width / 2, height / 2));
        }
        updateRepProgress((repsInCurrentSet / targetReps) * 100);
        if (repsInCurrentSet >= targetReps) {
          showSetFeedback();
          if (currentSet < targetSets) {
            currentSet++;
          }
          repsInCurrentSet = 0;
          updateSetProgress(((currentSet - 1) / targetSets) * 100);
          updateRepProgress(0);
        }

        isRepInProgress = false;
        hasFormMistakeInCurrentRep = false;
        maxAngleInRep = 0;
        lastRepTime = now;
      }
    }
  }

  // Update last angle
  if (side === "left") {
    lastLeftAngle = angle;
  } else {
    lastRightAngle = angle;
  }
}

function handleFormMistake(side) {
  const currentTime = Date.now();

  // Increment form mistakes counter
  formMistakes++;

  // Reset consecutive mistakes if enough time has passed
  if (currentTime - lastMistakeTime > MISTAKE_RESET_TIME) {
    consecutiveFormMistakes = 0;
  }

  consecutiveFormMistakes++;
  lastMistakeTime = currentTime;
  wrongFormTimer = 30;

  // Show feedback based on mistake severity
  if (consecutiveFormMistakes >= CONSECUTIVE_MISTAKE_THRESHOLD) {
    showDetailedFeedback(
      "Take a break and watch the tutorial to improve your form!"
    );
  } else {
    showDetailedFeedback(`Keep your ${side} arm closer to your body`);
  }

  // Send real-time feedback to React Native
  const feedback = {
    type: "formFeedback",
    data: {
      totalMistakes: formMistakes,
      consecutiveMistakes: consecutiveFormMistakes,
      message: `Form correction needed: Keep your ${side} arm closer to your body`,
    },
  };

  // Try both methods of sending message back to React Native
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(feedback));
  } else {
    window.postMessage(JSON.stringify(feedback), "*");
  }
}

function drawFeedbackOverlays() {
  // Handle red overlay for wrong form
  if (redOverlayStartTime > 0) {
    const elapsed = Date.now() - redOverlayStartTime;
    if (elapsed < RED_OVERLAY_DURATION) {
      // Calculate fade out
      const alpha = map(elapsed, 0, RED_OVERLAY_DURATION, 100, 0);
      push();
      fill(255, 0, 0, alpha);
      rect(0, 0, width, height);
      pop();
    } else {
      redOverlayStartTime = 0;
    }
  }
}

function drawSkeleton() {
  push();
  translate(width, 0);
  scale(-1, 1);

  const videoAspectRatio = capture.width / capture.height;
  const canvasAspectRatio = width / height;

  let scaledWidth, scaledHeight, x, y;

  if (videoAspectRatio > canvasAspectRatio) {
    scaledWidth = height * videoAspectRatio;
    scaledHeight = height;
    x = (width - scaledWidth) / 2;
    y = 0;
  } else {
    scaledWidth = width;
    scaledHeight = width / videoAspectRatio;
    x = 0;
    y = (height - scaledHeight) / 2;
  }

  if (isInSideView) {
    stroke(255, 122, 0, 200);
    strokeWeight(8);

    // Draw the visible arm based on currentSide
    if (currentSide === "left") {
      connectPoints(11, 13, x, y, scaledWidth, scaledHeight); // Left upper arm
      connectPoints(13, 15, x, y, scaledWidth, scaledHeight); // Left lower arm
      connectPoints(11, 23, x, y, scaledWidth, scaledHeight); // Left shoulder to hip

      // Draw landmarks for left side
      for (let i of [11, 13, 15, 23]) {
        const landmark = poses.poseLandmarks[i];
        if (landmark && landmark.visibility > 0.5) {
          const landmarkX = x + landmark.x * scaledWidth;
          const landmarkY = y + landmark.y * scaledHeight;

          fill(255, 122, 0);
          noStroke();
          circle(landmarkX, landmarkY, i === 23 ? 4 : 8);
        }
      }
    } else {
      connectPoints(12, 14, x, y, scaledWidth, scaledHeight); // Right upper arm
      connectPoints(14, 16, x, y, scaledWidth, scaledHeight); // Right lower arm
      connectPoints(12, 24, x, y, scaledWidth, scaledHeight); // Right shoulder to hip
      for (let i of [12, 14, 16, 24]) {
        const landmark = poses.poseLandmarks[i];
        if (landmark && landmark.visibility > 0.5) {
          const landmarkX = x + landmark.x * scaledWidth;
          const landmarkY = y + landmark.y * scaledHeight;

          fill(255, 122, 0);
          noStroke();
          circle(landmarkX, landmarkY, i === 24 ? 4 : 8);
        }
      }
    }
  } else {
    // In front view, show full skeleton with
    stroke(255, 200, 150, 150);
    strokeWeight(4);

    const connections = [
      [11, 12], // Shoulders
      [11, 23],
      [12, 24], // Shoulders to hips
      [23, 24], // Hips
      [23, 25],
      [24, 26], // Hips to knees
      [25, 27],
      [26, 28], // Knees to ankles
      [27, 31],
      [28, 32], // Ankles to feet
    ];

    for (let [i1, i2] of connections) {
      connectPoints(i1, i2, x, y, scaledWidth, scaledHeight);
    }

    // Draw arm connections with brighter orange
    stroke(255, 122, 0, 200);
    strokeWeight(8);

    // Arms
    connectPoints(11, 13, x, y, scaledWidth, scaledHeight); // Left upper arm
    connectPoints(13, 15, x, y, scaledWidth, scaledHeight); // Left lower arm
    connectPoints(12, 14, x, y, scaledWidth, scaledHeight); // Right upper arm
    connectPoints(14, 16, x, y, scaledWidth, scaledHeight); // Right lower arm

    // Draw landmarks
    for (let i = 0; i < poses.poseLandmarks.length; i++) {
      const landmark = poses.poseLandmarks[i];
      const landmarkX = x + landmark.x * scaledWidth;
      const landmarkY = y + landmark.y * scaledHeight;

      const isArmLandmark = [11, 13, 15, 12, 14, 16].includes(i);

      fill(255, 122, 0);
      noStroke();
      circle(landmarkX, landmarkY, isArmLandmark ? 8 : 4);
    }
  }
  pop();
}

function connectPoints(i1, i2, offsetX, offsetY, videoWidth, videoHeight) {
  const p1 = poses.poseLandmarks[i1];
  const p2 = poses.poseLandmarks[i2];

  const x1 = offsetX + p1.x * videoWidth;
  const y1 = offsetY + p1.y * videoHeight;
  const x2 = offsetX + p2.x * videoWidth;
  const y2 = offsetY + p2.y * videoHeight;

  line(x1, y1, x2, y2);
}

function calculateAngle(a, b, c) {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  let dot = ab.x * bc.x + ab.y * bc.y;
  let magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  let magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);

  let angle = Math.acos(dot / (magAB * magBC));
  angle = angle * (180 / Math.PI);

  return angle;
}

function calculateArmAlignment(shoulder, elbow, hip) {
  if (isInSideView) {
    // For side view, we care more about forward/backward deviation
    const armVector = {
      x: elbow.z - shoulder.z,
      y: elbow.y - shoulder.y,
    };

    const verticalVector = {
      x: 0,
      y: 1,
    };

    // Calculate angle between arm and vertical
    const dot = armVector.x * verticalVector.x + armVector.y * verticalVector.y;
    const armMagnitude = Math.sqrt(
      armVector.x * armVector.x + armVector.y * armVector.y
    );
    const angle = Math.acos(dot / armMagnitude) * (180 / Math.PI);

    return angle;
  } else {
    // Use original alignment calculation for front view
    const bodyVector = {
      x: hip.x - shoulder.x,
      y: hip.y - shoulder.y,
    };

    const armVector = {
      x: elbow.x - shoulder.x,
      y: elbow.y - shoulder.y,
    };

    const bodyMagnitude = Math.sqrt(
      bodyVector.x * bodyVector.x + bodyVector.y * bodyVector.y
    );
    const armMagnitude = Math.sqrt(
      armVector.x * armVector.x + armVector.y * armVector.y
    );

    const normalizedBody = {
      x: bodyVector.x / bodyMagnitude,
      y: bodyVector.y / bodyMagnitude,
    };

    const normalizedArm = {
      x: armVector.x / armMagnitude,
      y: armVector.y / armMagnitude,
    };

    const crossProduct =
      normalizedBody.x * normalizedArm.y - normalizedBody.y * normalizedArm.x;

    return crossProduct * 90;
  }
}

function updateRepProgress(percentage) {
  repProgressBar.style.width = `${percentage}%`;
}

function updateSetProgress(percentage) {
  setProgressBar.style.width = `${percentage}%`;
}

function showDetailedFeedback(message, type = "info") {
  const feedbackDiv = document.createElement("div");
  feedbackDiv.style.position = "fixed";
  feedbackDiv.style.bottom = "20px";
  feedbackDiv.style.left = "50%";
  feedbackDiv.style.transform = "translateX(-50%)";
  feedbackDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  feedbackDiv.style.color = "white";
  feedbackDiv.style.padding = "10px 20px";
  feedbackDiv.style.borderRadius = "5px";
  feedbackDiv.style.display = "flex";
  feedbackDiv.style.alignItems = "center";
  feedbackDiv.style.gap = "10px";
  feedbackDiv.style.zIndex = "1000";

  feedbackDiv.innerHTML = `${SVG_ICONS[type]} <span>${message}</span>`;
  document.body.appendChild(feedbackDiv);

  setTimeout(() => {
    feedbackDiv.remove();
  }, 3000);
}

function drawErrorMessages() {
  if (
    currentErrorMessage &&
    Date.now() - errorMessageStartTime < ERROR_MESSAGE_DURATION
  ) {
    const errorDiv = document.createElement("div");
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "50%";
    errorDiv.style.left = "50%";
    errorDiv.style.transform = "translate(-50%, -50%)";
    errorDiv.style.backgroundColor = "rgba(244, 67, 54, 0.9)";
    errorDiv.style.color = "white";
    errorDiv.style.padding = "15px 25px";
    errorDiv.style.borderRadius = "8px";
    errorDiv.style.display = "flex";
    errorDiv.style.alignItems = "center";
    errorDiv.style.gap = "10px";
    errorDiv.style.zIndex = "1000";

    errorDiv.innerHTML = `${SVG_ICONS.error} <span>${currentErrorMessage}</span>`;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, ERROR_MESSAGE_DURATION);
  }
}

function showSetFeedback() {
  isTrackingEnabled = false;
  currentSetNumber.textContent = currentSet;

  // Calculate performance metrics
  const wrongReps = repsInCurrentSet - perfectReps;
  let feedbackText = "";

  if (wrongReps === 0) {
    feedbackText = "Perfect form on all reps! Keep up the great work! 🌟";
  } else {
    feedbackText = `You had ${perfectReps} perfect reps and ${wrongReps} reps with form issues.<br>`;
    if (formMistakes > 0) {
      feedbackText +=
        "Focus on: <br>• Keeping your elbow steady<br>• Full range of motion<br>• Controlled movements";
    }
  }

  formFeedback.innerHTML = feedbackText;
  feedbackContainer.style.display = "block";

  // Send set completion stats to React Native
  const stats = {
    type: "setComplete",
    stats: {
      setNumber: currentSet,
      repsInSet: repsInCurrentSet,
      perfectReps: perfectReps,
      wrongReps: wrongReps,
      formMistakes: {
        incompleteRange: errorStats.incompleteRange,
        tooFastReps: errorStats.tooFastReps,
        misalignedArm: errorStats.misalignedArm,
        wrongStartAngle: errorStats.wrongStartAngle,
        wrongEndAngle: errorStats.wrongEndAngle,
      },
      totalReps: counter,
      completedSets: currentSet,
    },
  };

  // Send to React Native
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(stats));
  } else {
    window.postMessage(stats, "*");
  }

  // If this was the last set, send exercise completion stats
  if (currentSet >= targetSets) {
    const wrongReps = counter - perfectReps;
    const errors = Object.entries(errorStats);
    mostCommonError =
      errors.length > 0
        ? errors.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        : "none";

    const completionStats = {
      // Changed from stats to completionStats to avoid confusion
      type: "exerciseComplete",
      stats: {
        totalReps: counter,
        perfectReps: perfectReps,
        wrongReps: wrongReps,
        formMistakes: {
          incompleteRange: errorStats.incompleteRange,
          tooFastReps: errorStats.tooFastReps,
          misalignedArm: errorStats.misalignedArm,
          wrongStartAngle: errorStats.wrongStartAngle,
          wrongEndAngle: errorStats.wrongEndAngle,
        },
        completedSets: currentSet,
        errorStats: errorStats,
        mostCommonError: mostCommonError,
      },
    };

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(completionStats)); // Now matches the variable name
    } else {
      window.postMessage(completionStats, "*"); // Now matches the variable name
    }
  }
}

nextSetButton.addEventListener("click", () => {
  feedbackContainer.style.display = "none";
  isTrackingEnabled = true;
  formMistakes = 0;
  perfectReps = 0;
  repsInCurrentSet = 0;
  hasFormMistakeInCurrentRep = false;
  isRepInProgress = false;
  updateRepProgress(0);
});

// Update the showErrorIcon function to use SVG icons
function showErrorIcon(errorType) {
  const iconContainer = document.createElement("div");
  iconContainer.style.position = "fixed";
  iconContainer.style.top = "20px";
  iconContainer.style.right = "20px";
  iconContainer.style.zIndex = "1000";

  let icon;
  switch (errorType) {
    case "success":
      icon = SVG_ICONS.success;
      break;
    case "warning":
      icon = SVG_ICONS.warning;
      break;
    case "error":
      icon = SVG_ICONS.error;
      break;
    default:
      icon = SVG_ICONS.info;
  }

  iconContainer.innerHTML = icon;
  document.body.appendChild(iconContainer);

  setTimeout(() => {
    iconContainer.remove();
  }, 2000);
}

alert("Test Identifer: 481");
alert(targetReps + "Test");
