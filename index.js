const axios = require("axios");
const express = require("express");
const cheerio = require("cheerio");

async function getPriceFeed() {
  try {
    const siteUrl = "https://market.nbebank.com/market/banks/index.php";

    const { data } = await axios({
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    const elementSelector = "body > table > tbody > tr";

    const keys = ["currency", "buying", "selling"];
    const currencyExchangeArray = [];
    $(elementSelector).each((parentIdx, parentElem) => {
      let keyIdx = 0;
      const currencyExchangeObj = {};
      $(parentElem)
        .children()
        .each((childIdx, childElem) => {
          if (childIdx > 0) {
            const tdValue = $(childElem).text();
            if (tdValue) {
              currencyExchangeObj[keys[keyIdx]] = tdValue.trim();
              keyIdx++;
            }
          }
        });
      currencyExchangeArray.push(currencyExchangeObj);
    });

    return currencyExchangeArray.slice(1);
  } catch (err) {
    console.log(err);
  }
}

const app = express();

app.get("/api/price-feed", async (req, res) => {
  try {
    const priceFeed = await getPriceFeed();
    console.log(priceFeed[7].currency);
    return res.status(200).json({
      result: priceFeed,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString,
    });
  }
});

app.listen(3000, () => {
  console.log("running on port 3000");
});
