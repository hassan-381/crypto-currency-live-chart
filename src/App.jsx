// src/App.js
import React, { useEffect, useState } from "react";
import CurrencySelector from "./components/CurrencySelector";
import PriceChart from "./components/PriceChart";

function App() {
  const [selectedCurrency, setSelectedCurrency] = useState("");

  return (
    <div className="app min-h-screen bg-gradient-to-tr from-indigo-200 via-white to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center p-4">
      <h1 className="text-4xl font-extrabold my-6 text-indigo-600 dark:text-indigo-400 drop-shadow-lg tracking-wide">
        Crypto Live Tracker
      </h1>

      <CurrencySelector
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
      />
      <PriceChart selectedCurrency={selectedCurrency} />
    </div>
  );
}

export default App;
