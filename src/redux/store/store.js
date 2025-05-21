import { configureStore } from "@reduxjs/toolkit";
import cryptoReducer from "../slice/cryptoSlice";

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
  },
});
