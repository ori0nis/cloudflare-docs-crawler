export const chunker = (text, { maxSize = 1000, overlap = 200 } = {}) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentWords = [];
  let currentLength = 0;

  for (const word of words) {
    currentWords.push(word);
    currentLength += word.length + 1;

    if (currentLength >= maxSize) {
      chunks.push({
        content: currentWords.join(" ").trim(),
      });

      // Create overlap so that all chunks are likely to contain enough context
      const overlapWords = [];
      let overlapLength = 0;

      for (let i = currentWords.length - 1; i >= 0; i--) {
        const word = currentWords[i];
        if (overlapLength + word.length > overlap) break;

        overlapWords.unshift(word);
        overlapLength += word.length + 1;
      }

      currentWords = overlapWords;
      currentLength = overlapLength;
    }
  }

  if (currentWords.length > 0) {
    chunks.push({
      content: currentWords.join(" ").trim(),
    });
  }

  return chunks;
};