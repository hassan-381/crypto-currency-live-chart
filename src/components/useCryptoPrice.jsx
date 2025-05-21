import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addPrice } from "../redux/slice/cryptoSlice";

export default function useCryptoPrice() {
  const dispatch = useDispatch();
  const { selectedCurrency } = useSelector((state) => state.crypto);

  useEffect(() => {
    let interval = null;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets`,
          {
            params: {
              vs_currency: "usd",
              ids: selectedCurrency,
              order: "market_cap_desc",
              per_page: 1,
              page: 1,
              sparkline: false,
            },
            headers: {
              accept: "application/json",
            },
          }
        );
        const price = res.data[0]?.current_price;
        const timestamp = new Date().toLocaleTimeString();

        if (price) {
          dispatch(addPrice({ timestamp, price }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    interval = setInterval(fetchData, 10000); // 10 sec

    return () => clearInterval(interval);
  }, [selectedCurrency, dispatch]);
}
