// Audio Processing Worker
// This worker handles audio analysis and speech recognition

let audioContext = null;
let analyser = null;
let microphone = null;
let processor = null;
let isRecording = false;

// Initialize audio context
function initAudioContext() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    return true;
  } catch (error) {
    console.error("Failed to initialize audio context:", error);
    return false;
  }
}

// Process audio data
function processAudioData(audioData) {
  if (!analyser) return null;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // Calculate audio levels
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  const average = sum / bufferLength;

  // Detect speech activity
  const isSpeaking = average > 30; // Threshold for speech detection

  return {
    level: average,
    isSpeaking,
    timestamp: Date.now(),
  };
}

// Start recording
function startRecording() {
  if (isRecording) return;

  if (!audioContext) {
    if (!initAudioContext()) {
      postMessage({
        type: "error",
        message: "Failed to initialize audio context",
      });
      return;
    }
  }

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = function (e) {
        if (!isRecording) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const audioInfo = processAudioData(inputData);

        if (audioInfo) {
          postMessage({
            type: "audioData",
            data: audioInfo,
          });
        }
      };

      isRecording = true;
      postMessage({ type: "recordingStarted" });
    })
    .catch((error) => {
      postMessage({
        type: "error",
        message: "Failed to access microphone: " + error.message,
      });
    });
}

// Stop recording
function stopRecording() {
  if (!isRecording) return;

  isRecording = false;

  if (processor) {
    processor.disconnect();
    processor = null;
  }

  if (microphone) {
    microphone.disconnect();
    microphone = null;
  }

  postMessage({ type: "recordingStopped" });
}

// Process audio file
function processAudioFile(audioBlob) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const arrayBuffer = e.target.result;

    if (audioContext) {
      audioContext
        .decodeAudioData(arrayBuffer)
        .then((audioBuffer) => {
          const channelData = audioBuffer.getChannelData(0);
          const sampleRate = audioBuffer.sampleRate;
          const duration = audioBuffer.duration;

          // Analyze audio in chunks
          const chunkSize = 4096;
          const chunks = [];

          for (let i = 0; i < channelData.length; i += chunkSize) {
            const chunk = channelData.slice(i, i + chunkSize);
            chunks.push(chunk);
          }

          postMessage({
            type: "audioProcessed",
            data: {
              duration,
              sampleRate,
              chunks: chunks.length,
              totalSamples: channelData.length,
            },
          });
        })
        .catch((error) => {
          postMessage({
            type: "error",
            message: "Failed to decode audio: " + error.message,
          });
        });
    }
  };

  reader.readAsArrayBuffer(audioBlob);
}

// Handle messages from main thread
self.onmessage = function (e) {
  const { type, data } = e.data;

  switch (type) {
    case "init":
      const success = initAudioContext();
      postMessage({ type: "initResult", success });
      break;

    case "startRecording":
      startRecording();
      break;

    case "stopRecording":
      stopRecording();
      break;

    case "processAudioFile":
      processAudioFile(data.audioBlob);
      break;

    case "cleanup":
      stopRecording();
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      break;

    default:
      console.warn("Unknown message type:", type);
  }
};

// Handle errors
self.onerror = function (error) {
  postMessage({ type: "error", message: "Worker error: " + error.message });
};
