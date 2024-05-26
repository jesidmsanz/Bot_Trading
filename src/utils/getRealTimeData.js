const WebSocket = require("ws");

export default function getRealTimeData(symbol) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1s`
    );

    let dataPoints = [];

    ws.on("message", (message) => {
      const response = JSON.parse(message);
      const candle = response.k;

      dataPoints.push({
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
        volume: candle.v,
        closeTime: candle.T,
        quoteVolume: candle.q,
        trades: candle.n,
        baseAssetVolume: candle.V,
        quoteAssetVolume: candle.Q,
      });
      // Si tienes más de 100 puntos de datos, descarta los más antiguos
      if (dataPoints.length > 100) {
        dataPoints.shift();
      }

      // Solo resuelve la promesa si tienes 100 puntos de datos
      if (dataPoints.length === 100) {
        resolve(dataPoints);
        ws.close();
      }
    });

    ws.on("error", (error) => {
      reject(error);
    });
  });
}
