import React from "react";

export function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [value, setValue] = React.useState(fallbackValue);
  React.useEffect(() => {
    console.log("called get", key, value);
    const stored = localStorage.getItem(key);
    console.log(stored, stored ? JSON.parse(stored) : fallbackValue);
    setValue(stored ? JSON.parse(stored) : fallbackValue);
  }, [fallbackValue, key]);

  React.useEffect(() => {
    console.log("called set", key, value);
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
