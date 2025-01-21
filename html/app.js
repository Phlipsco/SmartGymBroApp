let poses = null;
let capture;
let counter = 0;
let wrongFormTimer = 0;
let lastWrongFormTime = 0;
let wrongFormCooldownTimer = 0;
const WRONG_FORM_COOLDOWN = 200;
let formMistakes = 0;
let perfectReps = 0;

let totalReps = 0;
let currentSet = 1;

const DOWN_ANGLE_THRESHOLD = 130;
const UP_ANGLE_THRESHOLD = 70;
// Animation system for feedback
let successAnimations = [];

// Form tracking
let consecutiveFormMistakes = 0;
const CONSECUTIVE_MISTAKE_THRESHOLD = 3;
let lastMistakeTime = 0;
const MISTAKE_RESET_TIME = 3000; // Reset consecutive mistakes after 3 seconds

// DOM elements
const repProgressBar = document.getElementById("rep-progress");
const setProgressBar = document.getElementById("set-progress");

let targetReps = 10;
let targetSets = 3;

// Add these variables near the top with other state variables
let isRepInProgress = false;
let hasFormMistakeInCurrentRep = false;
let startingAngle = 0;
let maxAngleInRep = 0; // Maximum angle reached during the current rep
let didReachEndAngle = false; // Flag to track if the end angle was reached
let repStartTime = 0;
const MIN_REP_DURATION = 1000; // Minimum 1 second for each rep
const TOO_FAST_MESSAGE = "Too fast! Take at least 1 second for each rep";

// Update these constants near the top of the file
const START_ANGLE_MIN = 20; // More lenient starting angle
const START_ANGLE_MAX = 75; // More lenient starting angle
const END_ANGLE_MIN = 120; // More lenient ending angle
const END_ANGLE_MAX = 160;
const ANGLE_THRESHOLD = 5; // More sensitive angle change detection
const ALIGNMENT_THRESHOLD = 45; // More lenient alignment threshold

const SIDE_VIEW_SHOULDER_THRESHOLD = 0.15; // Threshold for detecting side view based on shoulder width
const FRONT_VIEW_MESSAGE =
  "Please turn to your side for better bicep curl tracking";
let isInSideView = false;

// Add these messages as constants at the top
const RANGE_INSTRUCTION = `Required motion: Start (${START_ANGLE_MIN}°-${START_ANGLE_MAX}°) &#8594; End (${END_ANGLE_MIN}°-${END_ANGLE_MAX}°)`;
const INCOMPLETE_REP_MESSAGE = "Incomplete rep! Complete full range of motion";

// Add these constants at the top
const RED_OVERLAY_DURATION = 500; // 0.5 seconds for red overlay
let redOverlayStartTime = 0;
const ERROR_MESSAGE_DURATION = 3000; // 3 seconds for error messages
let currentErrorMessage = "";
let errorMessageStartTime = 0;

function checkViewPosition() {
  if (!poses || !poses.poseLandmarks) return false;

  const leftShoulder = poses.poseLandmarks[11];
  const rightShoulder = poses.poseLandmarks[12];

  // Calculate shoulder width in normalized coordinates
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

  // Update side view status
  isInSideView = shoulderWidth < SIDE_VIEW_SHOULDER_THRESHOLD;

  return isInSideView;
}

document.addEventListener("exerciseConfig", function (event) {
  console.log("Received exercise config:", event.detail);
  targetReps = event.detail.reps;
  targetSets = event.detail.sets;

  // Update UI elements
  updateSetProgress(((currentSet - 1) / targetSets) * 100);
  updateRepProgress(((counter % targetReps) / targetReps) * 100);
});

window.addEventListener("message", function (event) {
  console.log("Received postMessage:", event.data);
  try {
    const data =
      typeof event.data === "string" ? JSON.parse(event.data) : event.data;

    if (data.type === "exerciseConfig") {
      targetReps = data.reps;
      targetSets = data.sets;

      // Update UI elements
      updateSetProgress(((currentSet - 1) / targetSets) * 100);
      updateRepProgress(((counter % targetReps) / targetReps) * 100);

      console.log(
        `Exercise configured for ${targetSets} sets of ${targetReps} reps`
      );
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

// Debug log when the script loads
console.log("Exercise tracking script initialized");

// Add message listener for both postMessage and ReactNative
function handleMessage(event) {
  console.log("Received message:", event.data);

  let data;
  try {
    // Handle both string and object messages
    data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    console.log("Parsed message data:", data);

    if (data.type === "exerciseConfig") {
      targetReps = data.reps;
      targetSets = data.sets;
      console.log(
        `Exercise configured for ${targetSets} sets of ${targetReps} reps`
      );

      // Update UI elements
      updateSetProgress(((currentSet - 1) / targetSets) * 100);
      updateRepProgress(((counter % targetReps) / targetReps) * 100);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

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

// Improved state tracking for both arms
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
    this.opacity = 255;
    this.velocity = -2; // Slower upward movement
    this.size = 128;
    this.startTime = Date.now();
    this.duration = 1000; // Animation duration in milliseconds
  }

  update() {
    const elapsed = Date.now() - this.startTime;
    const progress = elapsed / this.duration;
    this.y += this.velocity;
    this.opacity = 255 * (1 - progress);
    return elapsed < this.duration;
  }

  draw() {
    push();
    textSize(this.size);
    textAlign(CENTER, CENTER);
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

  push();
  translate(width, 0);
  scale(-1, 1);

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

  image(
    capture,
    (width - scaledWidth) / 2,
    (height - scaledHeight) / 2,
    scaledWidth,
    scaledHeight
  );
  pop();

  if (poses && poses.poseLandmarks) {
    drawSkeleton();

    // Check view position and handle accordingly
    if (checkViewPosition()) {
      checkBicepCurl();
    } else {
      // Display message to turn to side
      push();
      fill(255);
      textSize(32);
      textAlign(CENTER, CENTER);
      text(FRONT_VIEW_MESSAGE, width / 2, height / 2);
      pop();
    }
  }

  // Draw error messages
  drawErrorMessages();

  // Update and draw success animations
  successAnimations = successAnimations.filter((animation) => {
    const isAlive = animation.update();
    if (isAlive) {
      animation.draw();
    }
    return isAlive;
  });

  drawFeedbackOverlays();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function checkBicepCurl() {
  // Get the visible arm landmarks (should be the closer arm in side view)
  const shoulderIndex = isInSideView ? 12 : 11; // Use right shoulder if in side view
  const elbowIndex = isInSideView ? 14 : 13;
  const wristIndex = isInSideView ? 16 : 15;
  const hipIndex = isInSideView ? 24 : 23;

  const shoulder = poses.poseLandmarks[shoulderIndex];
  const elbow = poses.poseLandmarks[elbowIndex];
  const wrist = poses.poseLandmarks[wristIndex];
  const hip = poses.poseLandmarks[hipIndex];

  const curlAngle = calculateAngle(shoulder, elbow, wrist);

  // Update angle history for smoothing
  const angleHistory = isInSideView ? rightAngleHistory : leftAngleHistory;
  if (isInSideView) {
    rightAngleHistory = [...rightAngleHistory.slice(1), curlAngle];
  } else {
    leftAngleHistory = [...leftAngleHistory.slice(1), curlAngle];
  }

  const smoothedAngle = angleHistory.reduce((a, b) => a + b) / REP_HISTORY_SIZE;

  const armAlignment = calculateArmAlignment(shoulder, elbow, hip);

  // Check arm movement only for the visible arm in side view
  checkArmMovement(
    smoothedAngle,
    armAlignment,
    isInSideView ? "right" : "left",
    isInSideView ? rightArmStage : leftArmStage,
    (newStage) => {
      if (isInSideView) {
        rightArmStage = newStage;
      } else {
        leftArmStage = newStage;
      }
    }
  );
}

function checkArmMovement(angle, alignment, side, currentStage, setStage) {
  // Display current angle and range requirements
  if (side === "right" && isInSideView) {
    push();
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(`Angle: ${angle.toFixed(1)}°`, width / 2, height / 2 - 40);

    // Show range requirements
    textSize(24);
    text(RANGE_INSTRUCTION, width / 2, height - 40);
    pop();
  }

  const angleChange = Math.abs(
    angle - (side === "left" ? lastLeftAngle : lastRightAngle)
  );

  // Only process movement if we're in side view and it's the right arm, or if we're in front view
  if ((isInSideView && side === "right") || !isInSideView) {
    if (angleChange > ANGLE_THRESHOLD) {
      // Start of rep - check if arm is within valid starting range
      if (
        !isRepInProgress &&
        angle >= START_ANGLE_MIN &&
        angle <= START_ANGLE_MAX
      ) {
        isRepInProgress = true;
        startingAngle = angle;
        hasFormMistakeInCurrentRep = false;
        maxAngleInRep = angle; // Reset max angle for this rep
        didReachEndAngle = false; // Reset end angle flag
        repStartTime = Date.now(); // Start timing the rep
        console.log(`${side} arm starting rep at angle: ${angle}`);
      }

      // During rep - check form only while rep is in progress
      if (isRepInProgress) {
        // Track the maximum angle reached during this rep
        if (angle > maxAngleInRep) {
          maxAngleInRep = angle;
          // Check if we've reached the target range
          if (angle >= END_ANGLE_MIN && angle <= END_ANGLE_MAX) {
            didReachEndAngle = true;
          }
        }

        const isArmMisaligned = Math.abs(alignment) > ALIGNMENT_THRESHOLD;

        // Check if arm goes too far down (less than starting range)
        if (angle < START_ANGLE_MIN) {
          hasFormMistakeInCurrentRep = true;
          showDetailedFeedback("Keep your arm up!");
        }

        // Check if arm is misaligned
        if (isArmMisaligned) {
          hasFormMistakeInCurrentRep = true;
          showDetailedFeedback("Keep your arm closer to your body!");
        }

        // Check if we're at the top of the movement (arm is going back down)
        if (angle <= maxAngleInRep - ANGLE_THRESHOLD * 2) {
          // Rep is finishing, evaluate it
          const now = Date.now();
          if (!lastRepTime || now - lastRepTime > 500) {
            counter++;
            lastRepTime = now;

            // Calculate rep duration
            const repDuration = now - repStartTime;
            console.log(
              `${side} arm completed rep ${counter} with max angle: ${maxAngleInRep}, duration: ${repDuration}ms`
            );

            // Check if the rep was too fast
            if (repDuration < MIN_REP_DURATION) {
              hasFormMistakeInCurrentRep = true;
              // Display the "too fast" message prominently
              push();
              fill(255, 0, 0);
              textSize(36);
              textAlign(CENTER, CENTER);
              text(TOO_FAST_MESSAGE, width / 2, height / 2);
              pop();
            }

            // Check if the rep reached the required range
            if (!didReachEndAngle || maxAngleInRep > END_ANGLE_MAX) {
              hasFormMistakeInCurrentRep = true;
              // Show detailed feedback about the range of motion
              if (maxAngleInRep < END_ANGLE_MIN) {
                showDetailedFeedback(
                  `Lift your arm higher! Reached ${maxAngleInRep.toFixed(
                    1
                  )}° (need ${END_ANGLE_MIN}°-${END_ANGLE_MAX}°)`
                );
              } else if (maxAngleInRep > END_ANGLE_MAX) {
                showDetailedFeedback(
                  `Don't lift too high! Reached ${maxAngleInRep.toFixed(
                    1
                  )}° (keep under ${END_ANGLE_MAX}°)`
                );
              }
            }

            // Now evaluate the entire rep
            if (hasFormMistakeInCurrentRep) {
              formMistakes++;
              redOverlayStartTime = Date.now(); // Start red overlay timer
              if (repDuration < MIN_REP_DURATION) {
                showDetailedFeedback(TOO_FAST_MESSAGE);
              } else {
                showDetailedFeedback(INCOMPLETE_REP_MESSAGE);
              }
            } else if (didReachEndAngle && repDuration >= MIN_REP_DURATION) {
              perfectReps++;
              // Always create success animation for perfect reps
              successAnimations.push(
                new SuccessAnimation(width / 2, height / 2)
              );
            }

            // Reset rep tracking
            isRepInProgress = false;
            hasFormMistakeInCurrentRep = false;
            maxAngleInRep = 0;
            didReachEndAngle = false;
            repStartTime = 0;
            setStage("down");

            updateRepProgress(((counter % targetReps) / targetReps) * 100);

            if (counter % targetReps === 0) {
              currentSet++;
              console.log(`Set ${currentSet} completed`);
              updateSetProgress(((currentSet - 1) / targetSets) * 100);

              if (currentSet > targetSets) {
                console.log("Exercise complete, sending stats");
                const stats = {
                  type: "exerciseComplete",
                  stats: {
                    totalReps: counter,
                    completedSets: currentSet - 1,
                    formMistakes: formMistakes,
                    perfectReps: perfectReps,
                    formAccuracy: ((perfectReps / counter) * 100).toFixed(1),
                  },
                };

                console.log("Sending completion stats:", stats);

                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify(stats));
                } else {
                  window.postMessage(JSON.stringify(stats), "*");
                }
              }
            }
          }
        }
      }
    }
  }

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
    // In side view, only show the visible arm and shoulder
    stroke(255, 122, 0, 200);
    strokeWeight(8);

    // Only draw the visible arm (right side in side view)
    connectPoints(12, 14, x, y, scaledWidth, scaledHeight); // Right upper arm
    connectPoints(14, 16, x, y, scaledWidth, scaledHeight); // Right lower arm
    connectPoints(12, 24, x, y, scaledWidth, scaledHeight); // Right shoulder to hip (for reference)

    // Draw landmarks only for the visible arm
    for (let i of [12, 14, 16, 24]) {
      const landmark = poses.poseLandmarks[i];
      const landmarkX = x + landmark.x * scaledWidth;
      const landmarkY = y + landmark.y * scaledHeight;

      fill(255, 122, 0);
      noStroke();
      circle(landmarkX, landmarkY, i === 24 ? 4 : 8); // Smaller point for hip
    }
  } else {
    // In front view, show full skeleton with emphasis on arms
    // Draw body connections with light orange color
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

function showDetailedFeedback(message) {
  currentErrorMessage = message;
  errorMessageStartTime = Date.now();
}

function drawErrorMessages() {
  if (
    currentErrorMessage &&
    Date.now() - errorMessageStartTime < ERROR_MESSAGE_DURATION
  ) {
    push();
    fill(255, 0, 0);
    textSize(36);
    textAlign(CENTER, CENTER);
    text(currentErrorMessage, width / 2, height / 2);
    pop();
  } else {
    currentErrorMessage = "";
  }
}

alert("Test Identifer: 420");
