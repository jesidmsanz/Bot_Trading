const ta = require('ta.js');


// Función para calcular indicadores técnicos
export default async function calculateIndicators(data) {
  const closePrices = data.map((d) => d.close);
  const ma50 = ta.sma(closePrices, 50);
  const ema50 = ta.ema(closePrices, 50);
  const rsi = ta.rsi(closePrices, 14);
  const macd = ta.macd(closePrices, 12, 26, 9);
  const atr = ta.atr(
    data.map((d) => [d.high, d.low, d.close]),
    14
  );

  return data.map((d, i) => ({
    ...d,
    ma50: ma50[i] || null,
    ema50: ema50[i] || null,
    rsi: rsi[i] || null,
    macd: macd[i] || null,
    atr: atr[i] || null,
  }));
}
