const chunker = (text) => {
  let chunks = [];
  let index = 0;
  let paragraphs = text.split("\n");
  let MAX_SIZE = 800;

  paragraphs.forEach((paragraph) => {
    // Ignore empty paragraphs
    if (!paragraph.trim()) return;

    // If paragraph < MAX_SIZE, add it as a single chunk
    if (paragraph.length <= MAX_SIZE) {
      chunks.push({
        index: index++,
        text: paragraph.trim(),
      });
    } else {
      // If paragraph > MAX_SIZE, split in sentences until chunk reaches MAX_SIZE
      let sentences = paragraph.split(".");
      let currentChunk = "";

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;

        // If sentence fits the current chunk -> accumulate
        if ((currentChunk + trimmedSentence + ".").length <= MAX_SIZE) {
          currentChunk += (currentChunk ? " " : "") + trimmedSentence + ".";
        } else {
          // If sentence doesn't fit, push current chunk and start a new chunk with current sentence
          if (currentChunk) {
            chunks.push({
              index: index++,
              text: currentChunk.trim(),
            });
          }

          currentChunk = trimmedSentence + ".";
        }
      }

      // If there's still content at the end of paragraph, push it so as not to lose it
      if (currentChunk) {
        chunks.push({
          index: index++,
          text: currentChunk.trim(),
        });
      }
    }
  });

  return chunks;
};
