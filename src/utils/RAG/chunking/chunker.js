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

/* export const chunker = (text) => {
  let chunks = [];
  let index = 0;
  let paragraphs = text.split("\n");
  let MIN_SIZE = 1000;
  let MAX_SIZE = 1500;
  let buffer = "";

  paragraphs.forEach((paragraph) => {
    // Ignore empty paragraphs
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) return;

    // If paragraph is < MIN_SIZE, accumulate it into buffer
    if (trimmedParagraph.length < MIN_SIZE) {
      buffer += (buffer ? " " : "") + trimmedParagraph;
      return;
    }

    // Before processing good or big paragraphs, flush buffer
    if (buffer) {
      chunks.push({
        index: index++,
        content: buffer.trim(),
      });

      buffer = "";
    }

    // If paragraph < MAX_SIZE, add it as a single chunk
    if (trimmedParagraph.length <= MAX_SIZE) {
      chunks.push({
        index: index++,
        content: trimmedParagraph,
      });
    } else {
      // If paragraph > MAX_SIZE, split in sentences until chunk reaches MAX_SIZE
      let sentences = trimmedParagraph.split(".");
      let currentChunk = "";

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;

        const candidate = (currentChunk ? currentChunk + " " : "") + trimmedSentence + ".";

        // If sentence fits the current chunk -> accumulate
        if (candidate.length <= MAX_SIZE) {
          currentChunk = candidate;
        } else {
          // If sentence doesn't fit, push current chunk and start a new chunk with current sentence
          if (currentChunk) {
            chunks.push({
              index: index++,
              content: currentChunk.trim(),
            });
          }

          // New chunk starts with current sentence
          currentChunk = trimmedSentence + ".";
        }
      }

      // If there's still content at the end of paragraph, push it so as not to lose it
      if (currentChunk) {
        chunks.push({
          index: index++,
          content: currentChunk.trim(),
        });
      }
    }
  });

  // Final buffer flush
  if (buffer) {
    chunks.push({
      index: index++,
      content: buffer.trim(),
    });
  }

  return chunks;
};
 */
