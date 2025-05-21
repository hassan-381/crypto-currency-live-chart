import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PriceChart = ({ selectedCurrency }) => {
  const [coinsList, setCoinsList] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [currency, setCurrency] = useState("usd");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceInfo, setPriceInfo] = useState(null);

  const fetchCoinData = async (
    coinId = selectedCurrency,
    vsCurrency = currency
  ) => {
    setLoading(true);
    setError(null);

    try {
      const coinsRes = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: { vs_currency: "usd" },
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": "CG-hMZPfqnqQvZnkZEH3s7sZZPu",
          },
        }
      );
      setCoinsList(coinsRes.data);

      const selectedCoinInfo = coinsRes.data.find((coin) => coin.id === coinId);
      setPriceInfo(selectedCoinInfo);

      const historyRes = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: vsCurrency,
            days: 30,
          },
        }
      );

      const formattedHistory = historyRes.data.prices.map(([time, price]) => ({
        time: new Date(time).toLocaleDateString(),
        price,
      }));

      setPriceHistory(formattedHistory);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCurrency) {
      fetchCoinData(selectedCurrency, currency);
      const interval = setInterval(
        () => fetchCoinData(selectedCurrency, currency),
        50000
      );
      return () => clearInterval(interval);
    }
  }, [selectedCurrency, currency]);

  const formatPrice = (value) => {
    if (value === undefined || value === null) return "--";
    return `${currency.toUpperCase()} ${Number(value).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const chartData = priceHistory.map((price, index) => ({
    time: price.time,
    price: price.price,
    priceUp:
      price.price > (priceHistory[index - 1]?.price || 0) ? price.price : null,
    priceDown:
      price.price < (priceHistory[index - 1]?.price || 0) ? price.price : null,
  }));

  if (loading) return <p className="text-center pt-4 text-white">Loading...</p>;
  if (error)
    return <p className="text-center pt-4 text-red-600">Error: {error}</p>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          {priceInfo?.name} Price History
        </h2>
        <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-800 dark:text-green-100 animate-pulse">
          Live Updating
        </span>
      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <img
          src={priceInfo?.image}
          alt={priceInfo?.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-md border border-gray-300 dark:border-gray-600 mb-2"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          {priceInfo?.name}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full">
        <div className="flex flex-col glass-card items-center py-3 px-2">
          <span className="text-sm sm:text-base text-white font-semibold">
            Current Price
          </span>
          <span className="text-lg sm:text-xl text-green-600 dark:text-green-400 break-words text-center">
            {formatPrice(priceInfo?.current_price)}
          </span>
        </div>
        <div className="flex flex-col glass-card items-center py-3 px-2">
          <span className="text-sm sm:text-base text-white font-semibold">
            Market Cap
          </span>
          <span className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 break-words text-center">
            {formatPrice(priceInfo?.market_cap)}
          </span>
        </div>
        <div className="flex flex-col glass-card items-center py-3 px-2">
          <span className="text-sm sm:text-base text-white font-semibold">
            Market Cap Rank
          </span>
          <span className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            {priceInfo?.market_cap_rank}
          </span>
        </div>
        <div className="flex flex-col glass-card items-center py-3 px-2">
          <span className="text-sm sm:text-base text-white font-semibold">
            24h Change
          </span>
          <span
            className={`text-lg sm:text-xl ${
              priceInfo?.price_change_24h >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatPrice(priceInfo?.price_change_24h)}
          </span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis
              dataKey="time"
              tick={{ fill: "white", fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: "white", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1d152f",
                border: "none",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="priceUp"
              stroke="#4ade80"
              dot={false}
              strokeWidth={2.5}
              connectNulls={true}
              name="Price Up"
            />
            <Line
              type="monotone"
              dataKey="priceDown"
              stroke="#f87171"
              dot={false}
              strokeWidth={2.5}
              connectNulls={true}
              name="Price Down"
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ color: "white", marginTop: "10px" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
