import * as cheerio from "cheerio";

export const cheerioProcessor = (html) => {
  const $ = cheerio.load(html);

  $("script").remove();
  $("style").remove();
  $("noscript").remove();
  $("iframe").remove();
  $("header").remove();
  $("nav").remove();
  $("footer").remove();
  $("aside").remove();
  $(".changelog, .release-list, .version-history").remove();

  let text = $.text();

  // Text cleanup
  text = text
    .replace(/\n\s*\n/g, "\n")
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
    const numbers = (block.match(/\d{4}/g) || []).length;
    return numbers < 5;
  });

  // Unite blocks again
  text = blocks.join("\n");

  return text;
};
