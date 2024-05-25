import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import binanceApi from "@/utils/api/binanceApi";
import { useEffect, useState } from "react";
import simpleMovingAverageStrategy from "@/utils/simpleMovingAverageStrategy";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [history, setHistory] = useState([]);
  const [indicatorsData, setIndicatorsData] = useState(null);
  const [fundamentalsData, setFundamentalsData] = useState(null);
  const [unifyData, setUnifyData] = useState(null);

  const getData = async () => {
    try {
      // Últimos 2 años
      const { historyData, indicators, fundamentals } =
        await binanceApi.getHistorySymbol("BTCUSDT");
      setHistory(historyData);
      setIndicatorsData(indicators);
      setFundamentalsData(fundamentals);
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  const unifyDataForAnalysis = (fundamental) => {
    return history.map((data) => ({
      ...data,
      current_price: fundamental.current_price,
      market_cap: fundamental.market_cap,
      volume_24h: fundamental.total_volume,
      ath: fundamental.ath,
      atl: fundamental.atl,
      market_cap_rank: fundamental.market_cap_rank,
    }));
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (fundamentalsData) {
      setUnifyData(unifyDataForAnalysis(fundamentalsData));
    }
  }, [fundamentalsData]);

  console.log("unifyData :>> ", unifyData?.length);

  if (unifyData) {
    unifyData.forEach((data) => {
      const { buySignal, sellSignal } = simpleMovingAverageStrategy(data);
      if (buySignal) {
        console.log(
          `Buy signal at ${new Date(data.timestamp).toLocaleDateString()}`
        );
      }
      if (sellSignal) {
        console.log(
          `Sell signal at ${new Date(data.timestamp).toLocaleDateString()}`
        );
      }
    });
  }
  return (
    <>
      <Head>
        <title>Bot Trading</title>
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.center}>By Jesid Bot Trading</div>
      </main>
    </>
  );
}
