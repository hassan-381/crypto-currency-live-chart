// src/features/crypto/cryptoSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_HEADERS = {
  accept: "application/json",
  "x-cg-pro-api-key": "CG-hMZPfqnqQvZnkZEH3s7sZZPu",
};

const cryptoSlice = createSlice({
  name: "crypto",
  initialState: {
    selectedCurrency: "bitcoin",
    priceHistory: [],
    coinsList: [], // All coins with images
    loading: false,
    error: null,
    coinData: {}, // Single coin data with details
  },
  reducers: {
    setCurrencyRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    setCurrencySuccess: (state, action) => {
      state.loading = false;
      state.selectedCurrency = action.payload;
      state.priceHistory = []; // Reset price history when changing currency
      state.error = null;
    },
    setCurrencyFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPriceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPriceSuccess: (state, action) => {
      state.loading = false;

      const newPriceData = action.payload;

      // Format the new price data to include priceUp and priceDown
      const formattedPriceData = {
        time: new Date().toLocaleTimeString(),
        price: newPriceData.price,
        priceUp:
          newPriceData.price >
          state.priceHistory[state.priceHistory.length - 1]?.price
            ? newPriceData.price
            : null,
        priceDown:
          newPriceData.price <
          state.priceHistory[state.priceHistory.length - 1]?.price
            ? newPriceData.price
            : null,
      };

      // Add the new price data to the priceHistory array, while keeping only the latest 24 data points
      state.priceHistory = [
        ...state.priceHistory.slice(-23),
        formattedPriceData,
      ];

      state.error = null;
    },
    fetchPriceFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getCoinDataSuccess: (state, action) => {
      state.coinData = action.payload; // Store the single coin data
    },
    getAllCoinsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllCoinsSuccess: (state, action) => {
      state.loading = false;
      state.coinsList = action.payload;
      state.error = null;
    },
    getAllCoinsFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors: (state) => {
      state.error = null;
    },
  },
});

const retryRequest = async (url, config = {}, retries = 3, delay = 10000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      if (i === retries - 1 || error.response?.status !== 429) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay)); // Retry after delay
    }
  }
  throw new Error("Maximum retry attempts reached");
};

export const getCoinData = (currency) => async (dispatch) => {
  try {
    const data = await retryRequest(
      `https://api.coingecko.com/api/v3/coins/${currency}`
    );
    dispatch(cryptoSlice.actions.getCoinDataSuccess(data));
  } catch (error) {
    if (error.message.includes("CORS")) {
      dispatch(cryptoSlice.actions.fetchPriceFailed("CORS issue detected"));
    } else if (error.response?.status === 429) {
      dispatch(
        cryptoSlice.actions.fetchPriceFailed(
          "Rate limit exceeded. Try again later."
        )
      );
    } else {
      dispatch(cryptoSlice.actions.fetchPriceFailed(error.message));
    }
  }
};

export const getAllCoins = () => async (dispatch) => {
  try {
    const data = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-cg-demo-api-key": "CG-hMZPfqnqQvZnkZEH3s7sZZPu",
        },
      }
    );
    return data;
  } catch (error) {
    if (error.message.includes("CORS")) {
      dispatch(cryptoSlice.actions.getAllCoinsFailed("CORS issue detected"));
    } else if (error.response?.status === 429) {
      dispatch(
        cryptoSlice.actions.getAllCoinsFailed(
          "Rate limit exceeded. Try again later."
        )
      );
    } else {
      dispatch(cryptoSlice.actions.getAllCoinsFailed(error.message));
    }
  }
};

export const setCurrency = (currency) => async (dispatch) => {
  dispatch(cryptoSlice.actions.setCurrencyRequest());
  try {
    dispatch(cryptoSlice.actions.setCurrencySuccess(currency));
    dispatch(cryptoSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(cryptoSlice.actions.setCurrencyFailed(error.message));
  }
};

export const fetchPrice = (currency) => async (dispatch) => {
  dispatch(cryptoSlice.actions.fetchPriceRequest());
  try {
    const data = await retryRequest(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: currency,
        },
        headers: API_HEADERS,
      }
    );

    const coinData = data[0];
    dispatch(
      cryptoSlice.actions.fetchPriceSuccess({
        price: coinData.current_price,
      })
    );

    dispatch(cryptoSlice.actions.clearAllErrors());
  } catch (error) {
    if (error.message.includes("CORS")) {
      dispatch(cryptoSlice.actions.fetchPriceFailed("CORS issue detected"));
    } else if (error.response?.status === 429) {
      dispatch(
        cryptoSlice.actions.fetchPriceFailed(
          "Rate limit exceeded. Try again later."
        )
      );
    } else {
      dispatch(cryptoSlice.actions.fetchPriceFailed(error.message));
    }
  }
};

export const clearAllCryptoErrors = () => async (dispatch) => {
  dispatch(cryptoSlice.actions.clearAllErrors());
};

// ------------- Export -------------
export default cryptoSlice.reducer;
