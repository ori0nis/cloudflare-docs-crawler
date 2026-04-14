import * as cheerio from "cheerio";

export const cheerioProcessor = (html) => {
  const $ = cheerio.load(html);

  // Technical noise
  $("script").remove();
  $("style").remove();
  $("noscript").remove();
  $("iframe").remove();
  $("header").remove();
  $("nav").remove();
  $("footer").remove();
  $("aside").remove();
  $(".changelog, .release-list, .version-history").remove();
  $(".hidden, .sr-only, .copy-button, .ad-container").remove();

  // Add space between blocks
  const body = $("body");
  body.find("h1, h2, h3, h4, p, li, tr").each((i, element) => {
    $(element).prepend("\n").append("\n");
  });

  let text = $("body").text();

  // Text cleanup
  text = text
    .replace(/\n\s*\n/g, "\n\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/https?:\/\/[^\s]+/g, "")
    .trim();

  // Prepare blocks for filtering
  let blocks = text
    .split("\n")
    .map((block) => block.trim())
    .filter((block) => block);

  // If there are more than 5 numbers of 4 digits, discard them
  blocks = blocks.filter((block) => {
    if (blocks.length < 40) return false;

    const numbers = (block.match(/\d{4}/g) || []).length;
    if (numbers >= 5) return false;

    // Avoid lines that are just symbols or punctuation
    const isOnlySymbols = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/.test(block);
    if (isOnlySymbols) return false;

    return true;
  });

  // Unite blocks again and return
  return blocks.join("\n");
};
