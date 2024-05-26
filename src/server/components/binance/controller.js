import calculateIndicators from "@/utils/calculateIndicators";
import createTradingLogic from "@/utils/createTradingLogic";
import getRealTimeData from "@/utils/getRealTimeData";
import prepareData from "@/utils/prepareData";
const Binance = require("binance-api-node").default;
const tf = require("@tensorflow/tfjs-node-gpu");
// Configurar la conexión con la API de Binance
const client = Binance({
  apiKey: "ZZ6mLN463zhLoP7WqqIdvsJ3UmVg1WbKpR2KaDTkGVRUpVmLAWgJRfLJ8AZwj6Db",
  apiSecret: "sCRZybu1vtcL0iFF05Fvb5Q6Lp8Og6DTDdWTSt3H2cKMluBgiZpHdcaLwSBO68aZ",
});

async function validCpuorGpu(symbol) {
  try {
    if (tf.backend().isUsingGpuDevice) {
      console.log("Using GPU");
    } else {
      console.log("Using CPU");
    }
  } catch (error) {
    console.error(`Error getting price for ${symbol}: ${error}`);
  }
}

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

  // Fecha hace 1 mes en milisegundos  30 *
  const oneMonthAgo = now - 24 * 60 * 60 * 1000;
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
  const { trainInputs, trainLabels } = await prepareData(data);
  console.log("Data prepared.");
  // Convertir los datos de entrada a tensores 3D
  const trainX = trainInputs;
  // Convertir los datos de salida a tensores 2D
  const trainY = trainLabels;

  console.log("Data prepared.");
  return { data, trainX, trainY };
}

async function createAndTrainModel({ trainX, trainY }) {
  console.log("trainX :>> ", trainX);
  console.log("trainY :>> ", trainY);
  // Convertir a tensores si no lo son ya
  if (!(trainX instanceof tf.Tensor)) {
    trainX = tf.tensor3d(trainX, [trainX.length, trainX[0].length, 1]);
  }
  if (!(trainY instanceof tf.Tensor)) {
    trainY = tf.tensor2d(trainY, [trainY.length, 1]);
  }

  // Crear el modelo
  const model = tf.sequential();
  model.add(
    tf.layers.lstm({
      units: 200,
      returnSequences: true,
      inputShape: [trainX.shape[1], trainX.shape[2]],
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

async function generateTrades() {
  // Carga el modelo
  const model = await tf.loadLayersModel("file://model/model.json");

  let lastSellPrice = null;

  while (true) {
    // Obtén los datos en tiempo real (esto dependerá de la API que estés utilizando)
    const data = await getRealTimeData("BTCUSDT");

    function shouldBuy(data) {
      // Selecciona solo las características 'open', 'high' y 'low' y conviértelas a números
      console.log("dataPoint :>> ", data[0]);
      // Asegúrate de que todos los valores son no nulos antes de crear el tensor
      const numericData = data.map((dataPoint) => {
        if (
          dataPoint.open &&
          dataPoint.high &&
          dataPoint.low &&
          dataPoint.volume
        ) {
          return [
            parseFloat(dataPoint.open),
            parseFloat(dataPoint.high),
            parseFloat(dataPoint.low),
            // Agrega aquí cualquier otro indicador que hayas usado
          ];
        } else {
          throw new Error("One or more data points are null or undefined");
        }
      });

      // Ahora puedes crear el tensor sin obtener un error
      const reshapedData = tf.tensor3d([numericData], [1, 100, 4]);
      // Asegúrate de que los datos de entrada tienen la forma correcta
      // const reshapedData = tf.tensor3d([numericData], [1, 100, 3]);
      // Usa tu modelo para hacer una predicción
      let prediction = model.predict(reshapedData);
      // Compra si el modelo predice que el precio va a subir
      return prediction.dataSync()[0] > 0.5;
    }

    function shouldSell(data) {
      // Selecciona solo las características 'open', 'high' y 'low' y conviértelas a números
      console.log("dataPoint :>> ", data[0]);
      const numericData = data.map((dataPoint) => {
        if (
          dataPoint.open &&
          dataPoint.high &&
          dataPoint.low &&
          dataPoint.volume
        ) {
          return [
            parseFloat(dataPoint.open),
            parseFloat(dataPoint.high),
            parseFloat(dataPoint.low),
            // Agrega aquí cualquier otro indicador que hayas usado
          ];
        } else {
          throw new Error("One or more data points are null or undefined");
        }
      });
      // Asegúrate de que los datos de entrada tienen la forma correcta
      const reshapedData = tf.tensor3d([numericData], [1, 100, 4]);
      // Usa tu modelo para hacer una predicción
      let prediction = model.predict(reshapedData);
      // Vende si el modelo predice que el precio va a bajar
      return prediction.dataSync()[0] < 0.5;
    }

    let trades = [];
    if (shouldBuy(data)) {
      trades.push({
        action: "buy",
        price: data[data.length - 1].close,
        time: data[data.length - 1].open,
      });
    } else if (
      shouldSell(data) &&
      data[data.length - 1].close !== lastSellPrice
    ) {
      trades.push({
        action: "sell",
        price: data[data.length - 1].close,
        time: data[data.length - 1].open,
      });
      lastSellPrice = data[data.length - 1].close;
    }

    console.log(trades);

    // Espera un tiempo antes de la próxima iteración para evitar el uso excesivo de recursos
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Ejecutar el bot
async function entreningBot() {
  const period = "1m";
  const { data, trainX, trainY } = await getHistoricalData("BTCUSDT", period);
  const model = await createAndTrainModel({ trainX, trainY });
  // const indicators = calculateIndicators(data);
  console.log("Firme");
}

const controllerBinace = {
  entreningBot,
  generateTrades,
  validCpuorGpu,
};
export default controllerBinace;
