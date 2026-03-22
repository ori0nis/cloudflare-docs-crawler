import * as cheerio from "cheerio";

export const cheerioProcessor = (html) => {
  const $ = cheerio.load(html);

  $("script").remove()
  $("style").remove()
  $("noscript").remove()
  $("iframe").remove()
  $("header").remove()
  $("nav").remove()
  $("footer").remove()

  return $.text();
};
