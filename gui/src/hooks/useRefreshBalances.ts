import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

export function useRefreshBalances(callback: () => unknown) {
  useEffect(() => {
    const unlisten = listen("erc20-balances-updated", () => {
      callback();
    });

    return () => {
      unlisten.then((cb) => cb());
    };
  }, [callback]);
}