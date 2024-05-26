// Función para preparar los datos para el modelo de TensorFlow.js
export default function prepareData(data) {
  // Extraer y convertir los precios de cierre a números
  const closePrices = data.map((d) => Number(d.close));

  // Normalizar los precios de cierre
  const min = Math.min(...closePrices);
  const max = Math.max(...closePrices);
  const normalizedData = closePrices.map(
    (price) => (price - min) / (max - min)
  );

  // Crear ventanas de tiempo
  const windowSize = 100;
  const inputs = [];
  const labels = [];
  for (let i = windowSize; i < normalizedData.length; i++) {
    inputs.push(normalizedData.slice(i - windowSize, i));
    labels.push(normalizedData[i]);
  }

  // Dividir en conjuntos de entrenamiento y prueba
  const splitIndex = Math.floor(0.8 * inputs.length);
  const trainInputs = inputs.slice(0, splitIndex);
  const testInputs = inputs.slice(splitIndex);
  const trainLabels = labels.slice(0, splitIndex);
  const testLabels = labels.slice(splitIndex);

  return { trainInputs, testInputs, trainLabels, testLabels };
}
