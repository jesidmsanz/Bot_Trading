const Twit = require("twit");

const T = new Twit({
  consumer_key: "k4IsMm9dd4ClHhJ3ri5HfY2FL",
  consumer_secret: "iOkjYu1QoaOMEkWd9a0AkHzl9CFdLKJuqyetL3lmbJYduP7Dph",
  access_token: "2725571873-hcZN8151T0FzIoNZ3NEKmLMILtFJpNJ0MfPGAem",
  access_token_secret: "Q3NdQoXVYJHTBuXpGcMY5qhQIFjJEfvg6WaFKqLlPX1OS",
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

const axios = require("axios");

async function getSentiment(symbol) {
  const searchParams = {
    query: symbol,
    "tweet.fields": "created_at,lang",
    max_results: 100,
  };

  try {
    const response = await axios.get(
      "https://api.twitter.com/2/tweets/search/recent",
      {
        params: searchParams,
        headers: {
          Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAGnbtwEAAAAAKyQBJuGYzswv7QrHetT9myismY0%3D9NT9UEbZMDAV7zAnPYOCiUOWeQDdmZHRVH5FXQpdvife9ScZyy`,
        },
      }
    );
    const tweets = response.data.data;
    console.log("tweets :>> ", tweets);
    // Análisis de sentimiento básico
    let positive = 0,
      negative = 0,
      neutral = 0;
    for (let tweet of tweets) {
      const sentiment = analyzeSentiment(tweet.text);
      if (sentiment === "positive") {
        positive++;
      } else if (sentiment === "negative") {
        negative++;
      } else {
        neutral++;
      }
    }
    return { positive, negative, neutral };
  } catch (error) {
    console.error(error);
  }
}
getSentiment('#Nvidia').then(result => console.log(result));