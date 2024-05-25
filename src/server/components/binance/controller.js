import axios from "axios";
const ta = require("ta.js");

function getHistoryPar() {
  return new Promise(async (resolve, reject) => {
    const symbol = "BTCUSDT";
    const interval = "1d";

    const end = Date.now();
    const start = end - 2 * 365 * 24 * 60 * 60 * 1000; // Últimos 2 años

    try {
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${start}&endTime=${end}`;
      const response = await axios.get(url);
      const data = response.data.map((candle) => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
      }));

      const closePrices = data.map((d) => d.close);
      const ma50 = ta.sma(closePrices, 50);
      const ma200 = ta.sma(closePrices, 200);
      const rsi = ta.rsi(closePrices, 14);

      const enrichedData = data.map((d, i) => ({
        ...d,
        ma50: ma50[i] || null,
        ma200: ma200[i] || null,
        rsi: rsi[i] || null,
      }));

      resolve(enrichedData);
    } catch (error) {
      console.error(error);
    }
  });
}

const controllerBasics = {
  getHistoryPar,
};
export default controllerBasics;
