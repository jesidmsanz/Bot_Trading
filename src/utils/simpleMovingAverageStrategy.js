export default function simpleMovingAverageStrategy(data) {
  const buySignal = data.close > data.ma50;
  const sellSignal = data.close < data.ma50;
  return { buySignal, sellSignal };
}
