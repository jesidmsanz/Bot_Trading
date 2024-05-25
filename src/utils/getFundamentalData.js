const axios = require("axios");

async function getFundamentalDataForex(symbol) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getCryptoDataCrypto(symbol) {
  const url = `https://api.coingecko.com/api/v3/coins/markets`;

  try {
    const response = await axios.get(url, {
      params: {
        vs_currency: "usd",
        ids: symbol,
      },
    });
    return response.data[0];
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getFundamentalDataForex,
  getCryptoDataCrypto,
};
