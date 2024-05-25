import calculateIndicators from "@/utils/calculateIndicators";
import { getCryptoDataCrypto } from "@/utils/getFundamentalData";
import axios from "axios";
const ta = require("ta.js");
const tf = require("@tensorflow/tfjs-node");
const TechnicalIndicators = require("technicalindicators");
const ws = require("ws");

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
      // Calcular MACD
      const macd = ta.macd(closePrices, 12, 26, 9); // Parámetros: precios de cierre, período corto, período largo, período de la línea de señal

      // Calcular ATR
      const atrInput = {
        high: data.map((d) => d.high),
        low: data.map((d) => d.low),
        close: data.map((d) => d.close),
        period: 14,
      };

      const atr = TechnicalIndicators.atr(atrInput);

      const historyData = data.map((d, i) => ({
        ...d,
        ma50: ma50[i] || null,
        ma200: ma200[i] || null,
        rsi: rsi[i] || null,
        macd: macd[i] || null, // Añadir MACD
        atr: atr[i] || null, // Añadir ATR
      }));

      const indicators = await calculateIndicators(historyData);
      const fundamentals = await getCryptoDataCrypto("bitcoin");
      const unifyDataForAnalysis = historyData
        .map((data) => ({
          ...data,
          current_price: fundamentals.current_price,
          market_cap: fundamentals.market_cap,
          volume_24h: fundamentals.total_volume,
          ath: fundamentals.ath,
          atl: fundamentals.atl,
          market_cap_rank: fundamentals.market_cap_rank,
        }))
        .filter((d) => Object.values(d).every((v) => v !== null));

      resolve({ historyData, indicators, fundamentals, unifyDataForAnalysis });
    } catch (error) {
      console.error(error);
    }
  });
}

async function machine(X_train, y_train) {
  const model = tf.sequential();
  model.add(
    tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [X_train[0].length, X_train[0][0].length],
    })
  );
  model.add(tf.layers.lstm({ units: 50 }));
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: "adam", loss: "meanSquaredError" });

  const xs = tf.tensor3d(X_train);
  const ys = tf.tensor2d(y_train, [y_train.length, 1]);

  await model.fit(xs, ys, { epochs: 50, batchSize: 32 });
  return model;
}

// Preprocesar datos para el modelo
function preprocessData(data) {
  const X = [];
  const y = [];

  for (let i = 50; i < data.length; i++) {
    X.push(
      data
        .slice(i - 50, i)
        .map((d) => [d.close, d.ma50, d.ma200, d.rsi, d.macd, d.atr])
    );
    y.push([data[i].close]);
  }

  return [X, y];
}

const trainingModel = async () => {
  const { unifyDataForAnalysis } = await getHistoryPar();
  const [X_train, y_train] = preprocessData(unifyDataForAnalysis);
  machine(X_train, y_train).then((model) => {
    console.log("Model trained");
    // Guardar el modelo
    const modelPath = "file://model";
    model.save(modelPath).then(() => {
      console.log("Model saved");
    });
  });
};

async function makePrediction(model, X_test) {
  if (
    !Array.isArray(X_test) ||
    !Array.isArray(X_test[0]) ||
    !Array.isArray(X_test[0][0])
  ) {
    throw new Error("X_test must be a 3D array");
  }
  const numFeatures = X_test[0][0].length;
  const xs = tf.tensor3d(X_test, [
    X_test.length,
    X_test[0].length,
    numFeatures,
  ]);
  const predictions = model.predict(xs);
  return predictions.arraySync();
}

const generateTradingSignals = (predictions) => {
  console.log("predictions :>> ", predictions);
  const signals = predictions.map((prediction, index) => {
    if (index > 0) {
      if (prediction[0] > predictions[index - 1][0]) {
        return "buy";
      } else {
        return "sell";
      }
    }
    return "hold";
  });
  return signals;
};

const prediction = async () => {
  try {
    const { unifyDataForAnalysis } = await getHistoryPar();

    const modelPath = "file://model/model.json";
    const model = await tf.loadLayersModel(modelPath);
    const data2D = unifyDataForAnalysis
      .slice(-50) // Adjusted from -60 to -50
      .map((d) => [
        Number(d.close),
        Number(d.ma50),
        Number(d.ma200),
        Number(d.rsi),
        Number(d.macd),
        Number(d.atr),
      ]);

    // Convert the 2D array to a 3D tensor
    const data3D = tf.tensor3d([data2D]);

    const predictions = await makePrediction(model, data3D.arraySync());
    const signals = generateTradingSignals(predictions);
  } catch (error) {
    console.log("error :>> ", error);
  }
};
const runBot = () => {
  setInterval(prediction, 10000);
};
// Run the prediction function every minute

const controllerBinace = {
  trainingModel,
  prediction,
  runBot,
};
export default controllerBinace;
