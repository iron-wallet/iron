import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash-es";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Contract } from "@iron/types";
import { useContracts, useNetworks } from "@/store";
import {
  ABIForm,
  AddressView,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@/components";
import { Navbar } from "@/components/Home/Navbar";

export const Route = createLazyFileRoute("/_home/home/contracts")({
  component: Contracts,
});

export function Contracts() {
  const chainId = useNetworks((s) => s.current?.chain_id);
  const contracts = useContracts((s) => s.contracts);
  const [filter, setFilter] = useState<string>("");

  return (
    <>
      <Navbar>Contracts</Navbar>
      {chainId != 31337 && <AddContractForm />}
      <FilterForm onChange={(f) => setFilter(f.toLowerCase())} />
      {Array.from(contracts || [])
        .filter((contract) =>
          `${contract.address} ${contract.name}`.toLowerCase().includes(filter),
        )
        .map((contract) => (
          <ContractView key={contract.address} contract={contract} />
        ))}
    </>
  );
}

function ContractView({
  contract: { address, name, chainId },
}: {
  contract: Contract;
}) {
  return (
    <Accordion>
      <AccordionSummary>
        <AddressView address={address} />
        <Chip sx={{ marginLeft: 2 }} label={name} />
      </AccordionSummary>
      <AccordionDetails>
        <ABIForm address={address} chainId={chainId} />
      </AccordionDetails>
    </Accordion>
  );
}

function AddContractForm() {
  const schema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid format"),
  });

  const add = useContracts((s) => s.add);

  const {
    handleSubmit,
    formState: { isValid, errors, isSubmitting },
    register,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FieldValues) => add(data.address);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row">
        <TextField
          label="Add by address"
          error={!!errors.address}
          helperText={errors.address?.message?.toString() || ""}
          fullWidth
          {...register("address")}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? <CircularProgress /> : "Add"}
        </Button>
      </Stack>
    </form>
  );
}

function FilterForm({ onChange }: { onChange: (address: string) => void }) {
  const schema = z.object({
    query: z.string(),
  });

  const add = useContracts((s) => s.add);

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FieldValues) => add(data.address);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Filter"
          error={!!errors.query}
          helperText={errors.query?.message?.toString() || ""}
          fullWidth
          {...register("query")}
          onChange={debounce((e) => {
            onChange(e.target.value);
          })}
        />
      </Stack>
    </form>
  );
}
