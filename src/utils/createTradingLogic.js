const tf = require("@tensorflow/tfjs-node");

export default async function createTradingLogic(model, indicators, prices) {
  // Definir la lógica de trading
  const tradingLogic = async (prices) => {
    // Predecir el próximo precio

    const predictedPrice = model
      .predict(tf.tensor2d([prices]))
      .arraySync()[0][0];
    console.log("predictedPrice :>> ", predictedPrice);
    console.log("prices :>> ", prices);

    // Obtener los indicadores técnicos actuales
    const { sma, rsi, bollingerBands } = indicators;

    // Obtener la última SMA, RSI y bandas de Bollinger
    const lastSMA = sma[sma.length - 1];
    const lastRSI = rsi[rsi.length - 1];
    const lastBollingerBands = bollingerBands[bollingerBands.length - 1];

    // Si el precio predicho es significativamente mayor que el precio actual y el RSI es menor que 30, comprar
    if (predictedPrice > prices * 1.01 && lastRSI < 30) {
      return "buy";
    }

    // Si el precio predicho es significativamente menor que el precio actual y el RSI es mayor que 70, vender
    if (predictedPrice < prices * 0.99 && lastRSI > 70) {
      return "sell";
    }

    // De lo contrario, no hacer nada
    return "hold";
  };

  const tradingDecision = await tradingLogic(prices);

  return tradingDecision;
}
