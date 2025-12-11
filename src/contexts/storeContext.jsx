/* eslint-disable react-refresh/only-export-components */
import React, { useContext, useReducer } from "react";
import { initStoreState, storeReducer } from "./reducers";

const StoreContext = React.createContext();
const DispatchContext = React.createContext();

const StoreContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initStoreState);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StoreContext.Provider value={state}>
        {children}
      </StoreContext.Provider>
    </DispatchContext.Provider>
  );
};

export default StoreContextProvider;

export const useStoreContext = () => useContext(StoreContext);
export const useDispatch = () => useContext(DispatchContext);
