import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { listen } from "@tauri-apps/api/event";
import classnames from "classnames";
import { formatEther } from "ethers/lib/utils";
import React from "react";
import { useEffect } from "react";
import useSWR from "swr";
import truncateEthAddress from "truncate-eth-address";

import { useAccount, useProvider } from "../hooks";
import { useInvoke } from "../hooks/tauri";
import Panel from "./Base/Panel";

export function Txs() {
  const account = useAccount();
  const { data: hashes, mutate } = useInvoke<string[]>("get_transactions", {
    address: account,
  });

  useEffect(() => {
    const unlisten = listen("refresh-transactions", () => {
      console.log("refresh");
      mutate();
    });

    return () => {
      unlisten.then((cb) => cb());
    };
  }, [mutate]);

  return (
    <Panel>
      <ul role="list" className="divide-y divide-gray-200">
        {(hashes || []).map((hash) => (
          <li key={hash}>
            <Receipt hash={hash} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Receipt({ hash }: { hash: string }) {
  const provider = useProvider();
  const { data: tx, mutate: mutate1 } = useSWR(
    !!provider && ["getTransaction", hash],
    ([, hash]) => provider?.getTransaction(hash)
  );
  const { data: receipt, mutate: mutate2 } = useSWR(
    !!provider && ["getTransactionReceipt", hash],
    ([, hash]) => provider?.getTransactionReceipt(hash)
  );

  useEffect(() => {
    mutate1();
    mutate2();
  }, [provider, mutate1, mutate2]);

  if (!receipt || !tx) return null;

  return (
    <a href="#" className="px-4 block hover:bg-gray-50">
      <div className="py-4">
        <div className="flex items-center justify-between">
          <p className="flex-grow min-w-0 truncate text-sm font-medium text-indigo-600">
            {hash}
          </p>
          <div className="flex flex-shrink-0">
            <Status status={receipt.status} />
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="flex flex-row items-center">
            <p className="flex items-center text-sm text-gray-500">
              {truncateEthAddress(receipt.from)}
              <ArrowRightIcon
                className="h-5 w-5 text-gray-400 sm:mx-2"
                aria-hidden="true"
              />
              {receipt.to ? truncateEthAddress(receipt.to) : "Contract Deploy"}
            </p>
            <p className="flex items-center text-sm text-gray-500 sm:mt-0 ml-5">
              {formatEther(tx.value)} Ξ
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}

function Status({ status }: { status?: number }) {
  return (
    <span
      className={classnames(
        "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
        {
          "bg-green-100 text-green-800": status == 1,
          "bg-red-100 text-red-800": status == 0,
        }
      )}
    >
      {status == 1 ? "Success" : "Failed"}
    </span>
  );
}
