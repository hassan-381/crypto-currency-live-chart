import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPrice } from "../redux/slice/cryptoSlice";

const PriceUpdater = () => {
  const dispatch = useDispatch();
  const { selectedCurrency } = useSelector((state) => state.crypto);

  useEffect(() => {
    // Pehli baar data lao
    dispatch(fetchPrice(selectedCurrency));

    // Har 10 sec bad data lao
    const interval = setInterval(() => {
      dispatch(fetchPrice(selectedCurrency));
    }, 10000);

    // Clean up (jab component band ho)
    return () => clearInterval(interval);
  }, [dispatch, selectedCurrency]);

  return null; // Ye component UI me kuch show nahi karega
};

export default PriceUpdater;
