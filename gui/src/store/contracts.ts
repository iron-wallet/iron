import { invoke } from "@tauri-apps/api/tauri";
import { Address } from "viem";
import { StateCreator, create } from "zustand";

import { ABIItem, IContract } from "../types";

const API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;

interface Store {
  data: Record<number, Array<IContract>>;

  init: () => void;
  addAddress: (chainId: number, address: Address) => void;
}

const store: StateCreator<Store> = (set, get) => ({
  data: {},

  init: async () => {
    const contracts = await invoke<IContract[]>("contracts_get_all", {
      chainId: 31337,
    });

    set({
      data: {
        31337: contracts.map(({ address }) => ({
          address,
          // TODO: get ABI from backend
          abi: [] as ABIItem[],
          name: "ERC20",
        })),
      },
    });
  },

  addAddress: async (chainId: number, address: Address) => {
    try {
      if (
        get().data[chainId]?.some((contract) => contract.address === address)
      ) {
        return;
      }

      const sourceCode = await getContractSourceCode(address);

      set(({ data }) => {
        return {
          data: {
            ...data,
            [chainId]: [...(data[chainId] || []), sourceCode],
          },
        };
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  },
});

export const useContracts = create<Store>()(store);

useContracts.getState().init();

const getContractSourceCode = async (address: Address): Promise<IContract> => {
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${API_KEY}`;

  return await fetch(url)
    .then((res) => res.json())
    .then(({ result }) => ({
      address,
      abi: (JSON.parse(result[0].ABI) as ABIItem[]).filter(
        ({ type }) => type === "function"
      ),
      name: result[0].ContractName,
    }));
};
