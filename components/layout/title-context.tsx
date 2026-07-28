"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const TitleContext = createContext<{
  title: string;
  setTitle: (t: string) => void;
}>({ title: "Dashboard", setTitle: () => {} });

export function TitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitleState] = useState("Dashboard");
  const setTitle = useCallback((t: string) => {
    setTitleState((prev) => (prev === t ? prev : t));
  }, []);
  const value = useMemo(() => ({ title, setTitle }), [title, setTitle]);
  return (
    <TitleContext.Provider value={value}>{children}</TitleContext.Provider>
  );
}

export function usePageTitle(title: string) {
  const { setTitle } = useContext(TitleContext);
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
}

export function useTitleValue() {
  return useContext(TitleContext).title;
}
