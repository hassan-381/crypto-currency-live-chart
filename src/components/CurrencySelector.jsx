import React, { useEffect, useState } from "react";

const CurrencySelector = ({ selectedCurrency, setSelectedCurrency }) => {
  const [coinsList, setCoinsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              "x-cg-demo-api-key": "CG-hMZPfqnqQvZnkZEH3s7sZZPu",
            },
          }
        );
        const data = await response.json();
        setCoinsList(data);
        if (data.length > 0) {
          setSelectedCurrency(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching coins:", error);
      }
    };

    fetchCoins();
  }, [setSelectedCurrency]);

  // Handle responsive visible coins count
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleCount(50);
      } else if (width >= 768) {
        setVisibleCount(20);
      } else {
        setVisibleCount(10);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const filteredCoins = searchQuery
    ? coinsList.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : coinsList.slice(0, visibleCount);

  return (
    <div className="w-full max-w-full mx-auto mt-6 bg-white/60 dark:bg-gray-800/60 rounded-xl shadow-lg p-6 backdrop-blur-md">
      <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-white text-center">
        Select Coin
      </label>

      <div className="mb-4 flex justify-center items-center">
        <input
          type="text"
          placeholder="Search coins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[800px] p-3 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {filteredCoins.map((coin) => (
          <button
            key={coin.id}
            onClick={() => setSelectedCurrency(coin.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
              selectedCurrency === coin.id
                ? "bg-indigo-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-indigo-100 dark:hover:bg-indigo-600"
            }`}
          >
            <img
              src={coin.image}
              alt={coin.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col justify-center items-start">
              <span className="text-sm font-medium">{coin.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-300">
                {coin.symbol.toUpperCase()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CurrencySelector;
