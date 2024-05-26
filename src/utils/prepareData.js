import {
  getCryptoDataCrypto,
  getCryptoPriceHistory,
} from "./getFundamentalData";

const tf = require("@tensorflow/tfjs-node-gpu");

function calculateSMA(data, windowSize, index) {
  if (index < windowSize) {
    return null; // No hay suficientes datos para calcular la SMA
  }
  let sum = 0;
  for (let i = 0; i < windowSize; i++) {
    sum += Number(data[index - i].close);
  }
  return sum / windowSize;
}

function calculateRSI(data, windowSize, index) {
  if (index < windowSize) {
    return null; // No hay suficientes datos para calcular la RSI
  }
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= windowSize; i++) {
    const change =
      Number(data[index - i + 1].close) - Number(data[index - i].close);
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }
  const averageGain = gains / windowSize;
  const averageLoss = losses / windowSize;
  const rs = averageGain / averageLoss;
  return 100 - 100 / (1 + rs);
}

export default async function prepareData(data) {
  const fundamentalData = await getCryptoDataCrypto("bitcoin");

  const enhancedData = data
    .map((d, index) => {
      const sma = calculateSMA(data, 10, index);
      const rsi = calculateRSI(data, 14, index);
      const marketCap = fundamentalData.market_cap;
      const totalVolume = fundamentalData.total_volume;
      return { ...d, sma, rsi, marketCap, totalVolume };
    })
    .filter((item) => Object.values(item).every((value) => value !== null));

  // Extraer y convertir los precios de cierre y los indicadores a números
  const closePrices = enhancedData.map((d) => Number(d.close));
  const smas = enhancedData.map((d) => Number(d.sma));
  const rsis = enhancedData.map((d) => Number(d.rsi));

  // Normalizar los precios de cierre y los indicadores
  const minClose = Math.min(...closePrices);
  const maxClose = Math.max(...closePrices);
  const normalizedClose = closePrices.map(
    (price) => (price - minClose) / (maxClose - minClose)
  );

  const { total_volumes, market_caps } = await getCryptoPriceHistory(
    "bitcoin",
    60,
    "usd",
    normalizedClose.length
  );
  const marketCapValues = market_caps.map((item) => item[1]);
  const maxMarketCap = Math.max(...marketCapValues);
  const minMarketCap = Math.min(...marketCapValues);
  console.log("minMarketCap :>> ", minMarketCap);
  console.log("maxMarketCap :>> ", maxMarketCap);
  const totalVolumesValues = total_volumes.map((item) => item[1]);
  const maxVolumen = Math.max(...marketCapValues);
  const minVolumen = Math.min(...marketCapValues);
  console.log("maxVolumen :>> ", maxVolumen);
  console.log("minVolumen :>> ", minVolumen);

  const minSma = Math.min(...smas);
  const maxSma = Math.max(...smas);
  const normalizedSma = smas.map((sma) => (sma - minSma) / (maxSma - minSma));

  const minRsi = Math.min(...rsis);
  const maxRsi = Math.max(...rsis);
  const normalizedRsi = rsis.map((rsi) => (rsi - minRsi) / (maxRsi - minRsi));
  console.log("normalizedRsi :>> ", normalizedRsi.length);

  const normalizedMarketCap = marketCapValues.map(
    (marketCap) => (marketCap - minMarketCap) / (maxMarketCap - minMarketCap)
  );
  console.log("normalizedMarketCap :>> ", normalizedMarketCap.length);
  const minTotalVolume = Math.min(...totalVolumesValues);
  const maxTotalVolume = Math.max(...totalVolumesValues);
  const normalizedTotalVolume = totalVolumesValues.map(
    (totalVolume) =>
      (totalVolume - minTotalVolume) / (maxTotalVolume - minTotalVolume)
  );
  console.log("normalizedTotalVolume :>> ", normalizedTotalVolume.length);
  // Crear ventanas de tiempo
  const windowSize = 100;
  const inputs = [];
  const labels = [];
  console.log("normalizedClose.length :>> ", normalizedClose.length);
  for (let i = windowSize; i < normalizedClose.length; i++) {
    const windowData = [];
    for (let j = 0; j < windowSize; j++) {
      const close = normalizedClose[i - j];
      const sma = normalizedSma[i - j];
      const rsi = normalizedRsi[i - j];
      const marketCap = normalizedMarketCap[i - j];
      const totalVolume = normalizedTotalVolume[i - j];
      if (
        close !== undefined &&
        sma !== undefined &&
        rsi !== undefined &&
        marketCap !== undefined &&
        totalVolume !== undefined
      ) {
        windowData.unshift([close, sma, rsi, marketCap, totalVolume]);
      }
    }

    if (windowData.length === windowSize) {
      inputs.push(windowData);
      labels.push(normalizedClose[i]);
    }
  }
  // Dividir en conjuntos de entrenamiento y prueba
  const splitIndex = Math.floor(0.8 * inputs.length);
  const trainInputs = inputs.slice(0, splitIndex);
  const trainLabels = labels.slice(0, splitIndex);

  console.log("trainInputs.length :>> ", trainInputs.length);
  console.log("trainInputs.length :>> ", trainInputs[0].length);
  console.log("trainInputs.length :>> ", trainInputs[0][0].length);

  const trainInputsTensor = tf.tensor3d(trainInputs, [
    trainInputs.length,
    trainInputs[0].length,
    trainInputs[0][0].length,
  ]);
  const trainLabelsTensor = tf.tensor2d(trainLabels, [trainLabels.length, 1]);
  console.log("trainInputsTensor :>> ", trainInputsTensor);
  console.log("trainLabelsTensor :>> ", trainLabelsTensor);

  return { trainInputs: trainInputsTensor, trainLabels: trainLabelsTensor };
}
