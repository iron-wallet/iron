import { Stack, Chip, Typography, Avatar } from "@mui/material";
import { Address, Abi, AbiFunction } from "abitype";
import { useState, useEffect, Fragment } from "react";
import { formatUnits, decodeFunctionData } from "viem";

import { useInvoke } from "@/hooks";
import { AddressView, MonoText } from "./";

interface SummaryProps {
  value?: bigint;
  data: `0x${string}`;
  to: Address;
  chainId?: number;
  decimals?: number;
}

export function HumanReadableCall({
  value = 0n,
  data,
  to,
  chainId,
  decimals = 18,
}: SummaryProps) {
  if (!data || data.length === 0) {
    return <SummaryBase {...{ value, to, decimals }} />;
  } else {
    return (
      <SummaryFunction {...{ value, data, contract: to, chainId, decimals }} />
    );
  }
}

interface SummaryBaseProps {
  value: bigint;
  to: Address;
  decimals: number;
}

function SummaryBase({ value, to, decimals }: SummaryBaseProps) {
  return (
    <Stack direction="row" spacing={1}>
      <MonoText>Sending</MonoText>
      <Arg name="Ξ" type="bigint" value={formatUnits(value, decimals)} />
      <Arg name="to" type="address" value={to} />
    </Stack>
  );
}

interface SummaryFunctionProps {
  value: bigint;
  data: `0x${string}`;
  contract: Address;
  chainId?: number;
  decimals: number;
}

function SummaryFunction({
  value,
  data,
  contract,
  chainId,
  decimals,
}: SummaryFunctionProps) {
  const { data: abi } = useInvoke<Abi>("get_contract_abi", {
    address: contract,
    chainId,
  });

  const [label, setLabel] = useState<string>(data);
  const [args, setArgs] = useState<[string, string, string][]>([]);

  useEffect(() => {
    if (!abi) return;
    const decoded = decodeFunctionData({
      abi: abi || [],
      data,
    });

    const item = abi?.find(
      (i) => i.type == "function" && i.name === decoded?.functionName,
    ) as AbiFunction;

    const args: [string, string, string][] = (decoded.args ?? []).map(
      (arg, i) => {
        const type = item.inputs[i].type;
        const name = item.inputs[i].name;

        return [arg as string, type, name || ""];
      },
    );

    setLabel(decoded?.functionName);
    setArgs(args);
  }, [abi, data]);

  return (
    <Chip
      label={
        <Stack direction="row" alignItems="center">
          <Fragment>
            <Arg
              name="contract"
              value={contract}
              type="address"
              color="primary"
            />
          </Fragment>
          <MonoText>: {label}</MonoText>
          {value > 0n && (
            <>
              <MonoText>&#123;</MonoText>

              <Arg
                name="Ξ"
                type="bigint"
                value={formatUnits(value, decimals)}
                color="secondary"
              />
              <MonoText>&#125;</MonoText>
            </>
          )}
          <MonoText>(</MonoText>
          {args.map(([value, type, name], i) => (
            <Fragment key={i}>
              {i! > 0 && ", "}
              <Arg {...{ name, value, type, color: "secondary" }} />
            </Fragment>
          ))}
          <MonoText>)</MonoText>
        </Stack>
      }
    />
  );
}

interface ArgProps {
  name: string;
  value: Address | string | bigint;
  type: string;
  color: "primary" | "secondary";
}

function Arg({ name, type, value, color }: ArgProps) {
  return (
    <Chip
      color={color}
      sx={{ backgroundOpacity: 0.2 }}
      label={
        <Stack direction="row">
          <Chip color="secondary" label={<MonoText>{name}: </MonoText>} />
          {type === "address" ? (
            <AddressView mono address={value as Address} />
          ) : (
            value.toString()
          )}
        </Stack>
      }
    />
  );
}
