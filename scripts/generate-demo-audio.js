const fs = require("fs");
const path = require("path");

const mediaDir = path.join(__dirname, "..", "media");
fs.mkdirSync(mediaDir, { recursive: true });

const sampleRate = 44100;
const seconds = 16;
const songProfiles = [
  ["song-1.wav", 196, 247],
  ["song-2.wav", 220, 277],
  ["song-3.wav", 247, 330],
  ["song-4.wav", 174, 220],
  ["song-5.wav", 262, 392],
  ["song-6.wav", 185, 233],
  ["song-7.wav", 208, 311],
  ["song-8.wav", 147, 196]
];

function writeString(buffer, offset, value) {
  buffer.write(value, offset, value.length, "ascii");
}

function createWave(fileName, baseFrequency, accentFrequency) {
  const samples = sampleRate * seconds;
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  writeString(buffer, 0, "RIFF");
  buffer.writeUInt32LE(36 + dataSize, 4);
  writeString(buffer, 8, "WAVE");
  writeString(buffer, 12, "fmt ");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  writeString(buffer, 36, "data");
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.min(1, i / (sampleRate * 0.6), (samples - i) / (sampleRate * 0.8));
    const beat = Math.sin(2 * Math.PI * 2 * t) > 0.75 ? 0.22 : 0;
    const tone =
      Math.sin(2 * Math.PI * baseFrequency * t) * 0.42 +
      Math.sin(2 * Math.PI * accentFrequency * t) * 0.22 +
      Math.sin(2 * Math.PI * (baseFrequency / 2) * t) * beat;
    const value = Math.max(-1, Math.min(1, tone * envelope));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(mediaDir, fileName), buffer);
}

songProfiles.forEach(([fileName, baseFrequency, accentFrequency]) => {
  createWave(fileName, baseFrequency, accentFrequency);
});

console.log(`Generated ${songProfiles.length} playable demo tracks in ${mediaDir}`);
