export const chunkHasher = async (chunk: string): Promise<string> => {
  const normalized = chunk.trim().toLowerCase().replace(/\s+/g, " ");

  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
};
