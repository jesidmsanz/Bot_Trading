import calculateIndicators from "@/utils/calculateIndicators";
import createTradingLogic from "@/utils/createTradingLogic";
import prepareData from "@/utils/prepareData";
const Binance = require("binance-api-node").default;
const tf = require("@tensorflow/tfjs-node");

// Configurar la conexión con la API de Binance
const client = Binance({
  apiKey: "ZZ6mLN463zhLoP7WqqIdvsJ3UmVg1WbKpR2KaDTkGVRUpVmLAWgJRfLJ8AZwj6Db",
  apiSecret: "sCRZybu1vtcL0iFF05Fvb5Q6Lp8Og6DTDdWTSt3H2cKMluBgiZpHdcaLwSBO68aZ",
});

async function getCurrentPrice(symbol) {
  try {
    const ticker = await client.prices();
    return parseFloat(ticker[symbol]);
  } catch (error) {
    console.error(`Error getting price for ${symbol}: ${error}`);
  }
}

async function getHistoricalData(symbol, interval) {
  // Fecha actual en milisegundos
  const now = Date.now();

  // Fecha hace 1 mes en milisegundos
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
  let data = [];
  let time = oneMonthAgo;

  while (time < now) {
    console.log(
      `Fetching data from ${new Date(time).toISOString()} to ${new Date(
        now
      ).toISOString()}`
    );
    const candles = await client.candles({ symbol, interval, startTime: time });
    data = [...data, ...candles];
    time = data[data.length - 1].closeTime + 1;
    console.log(
      `Fetched ${candles.length} data points. Total data points: ${data.length}`
    );
  }

  console.log("Preparing data for model...");
  const { trainInputs, trainLabels } = prepareData(data);
  // const num_samples = trainInputs.length;
  // const num_timesteps = 100; // Ajusta esto según tus datos
  // const num_features = trainInputs[0].length;

  // Convertir los datos de entrada a tensores 3D
  const trainX = tf.tensor2d(trainInputs).expandDims(2);
  // Convertir los datos de salida a tensores 2D
  const trainY = tf.tensor2d(trainLabels, [trainLabels.length, 1]);

  console.log("Data prepared.");
  return { data, trainX, trainY };
}

async function createAndTrainModel({ trainX, trainY }) {
  // Convertir a tensores si no lo son ya
  if (!(trainX instanceof tf.Tensor)) {
    trainX = tf.tensor3d(trainX, [trainX.length, trainX[0].length, 1]);
  }
  if (!(trainY instanceof tf.Tensor)) {
    trainY = tf.tensor2d(trainY, [trainY.length, 1]);
  }

  console.log("trainX, trainY :>> ", trainX, trainY);

  // Crear el modelo
  const model = tf.sequential();
  model.add(
    tf.layers.lstm({
      units: 200,
      returnSequences: true,
      inputShape: [trainX.shape[1], trainX.shape[2]], // Corregido aquí
    })
  );
  model.add(tf.layers.dropout(0.2));
  model.add(tf.layers.lstm({ units: 100 }));
  model.add(tf.layers.dropout(0.2));
  model.add(tf.layers.dense({ units: 1 }));

  // Compilar el modelo
  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  // Entrenar el modelo
  await model.fit(trainX, trainY, {
    epochs: 100,
  });

  // Guardar el modelo
  await model.save("file://model");
}

// Ejecutar el bot
async function runBot() {
  const { data, trainX, trainY } = await getHistoricalData("BTCUSDT", "1m");
  const model = await createAndTrainModel({ trainX, trainY });
  // const indicators = calculateIndicators(data);
  // const last10Prices = data.slice(-10).map((item) => Number(item.close));

  // const tradingLogic = await createTradingLogic(
  //   model,
  //   indicators,
  //   last10Prices
  // );

  // await startTrading(tradingLogic);
  // await testAndOptimizeBot();
  // console.log("tradingLogic :>> ", tradingLogic);
}

const controllerBinace = {
  runBot,
};
export default controllerBinace;
