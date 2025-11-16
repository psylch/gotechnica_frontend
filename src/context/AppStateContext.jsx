import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const initialState = {
  imageUrl: '',
  userPreference: '',
  centralObject: '',
  card: null,
  conversationId: null,
  chatHistory: [],
  processingPayload: null,
  autoPlayAudio: false,
};

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((updater) => {
    setState((prev) => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  }, []);

  const resetState = useCallback(() => setState(initialState), []);

  const value = useMemo(
    () => ({ state, updateState, resetState }),
    [state, updateState, resetState]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
