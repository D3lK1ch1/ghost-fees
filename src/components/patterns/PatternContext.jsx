import { createContext, useContext } from 'react';

// Results-page state for money patterns: which popup is open and the "Sound like you?"
// answers. Session only (React state), never saved, like the rest of the results.
export const PatternContext = createContext(null);
export const usePatterns = () => useContext(PatternContext);
