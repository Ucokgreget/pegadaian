// lib/chunkText.js

export function chunkText(text, chunkWords = 180, overlapWords = 30) {
  if (!text) return [];

  if (chunkWords <= overlapWords) {
    throw new Error("chunkWords harus lebih besar dari overlapWords");
  }

  const cleanedText = text.replace(/\s+/g, " ").trim();
  if (!cleanedText) return [];

  const words = cleanedText.split(" ");
  const chunks = [];

  const step = chunkWords - overlapWords;

  for (let i = 0; i < words.length; i += step) {
    const chunk = words.slice(i, i + chunkWords).join(" ").trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (i + chunkWords >= words.length) {
      break;
    }
  }

  return chunks;
}
