const ti = require("technicalindicators");

export default function calculateIndicators(data, period = 30) {
  let close = data.map((item) => Number(item.close));
  let high = data.map((item) => Number(item.high));
  let low = data.map((item) => Number(item.low));

  // Calculate Simple Moving Average (SMA)
  let sma = ti.SMA.calculate({ period: period, values: close });

  // Calculate Relative Strength Index (RSI)
  let rsi = ti.RSI.calculate({ period: period, values: close });

  // Calculate Bollinger Bands
  let bb = ti.BollingerBands.calculate({
    period: period,
    stdDev: 2,
    values: close,
  });

  // Calculate Average True Range (ATR)
  let atr = ti.ATR.calculate({
    period: period,
    high: high,
    low: low,
    close: close,
  });

  // Add indicators to data
  for (let i = 0; i < data.length; i++) {
    if (i >= period) {
      data[i].sma = sma[i - period];
      data[i].rsi = rsi[i - period];
      data[i].bb = bb[i - period];
      data[i].atr = atr[i - period];
    } else {
      data[i].sma = null;
      data[i].rsi = null;
      data[i].bb = null;
      data[i].atr = null;
    }
  }

  return data;
}
