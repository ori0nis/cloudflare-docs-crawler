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

  let text = $.text();

  // Replace unnecessary spaces
  text = text
    .replace(/\n\s*\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .trim();

  return text;
};
