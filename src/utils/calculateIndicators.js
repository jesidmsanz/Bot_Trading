const TechnicalIndicators = require("technicalindicators");

export default function calculateIndicators(data) {
  // Extraer los precios de cierre
  const closingPrices = data.map((candle) => parseFloat(candle.close));

  // Calcular la SMA
  const sma = TechnicalIndicators.SMA.calculate({
    values: closingPrices,
    period: 14,
  });

  // Calcular el RSI
  const rsi = TechnicalIndicators.RSI.calculate({
    values: closingPrices,
    period: 14,
  });

  // Calcular las bandas de Bollinger
  const bollingerBands = TechnicalIndicators.BollingerBands.calculate({
    values: closingPrices,
    period: 20,
    stdDev: 2,
  });

  return { sma, rsi, bollingerBands };
}
