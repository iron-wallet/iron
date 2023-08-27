import { zodResolver } from "@hookform/resolvers/zod";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Stack,
  TextField,
} from "@mui/material";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import { useContracts, useNetworks } from "../store";
import { IContract } from "../types";
import { ABIForm, AddressView, Panel } from "./";

export function Contracts() {
  const chainId = useNetworks((s) => s.current?.chain_id);
  const contracts = useContracts((s) => s.contracts);

  return (
    <Panel>
      {chainId != 31337 && <AddressInput />}
      {Array.from(contracts || []).map((contract) => (
        <Contract key={contract.address} contract={contract} />
      ))}
    </Panel>
  );
}

function Contract({ contract }: { contract: IContract }) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <AddressView address={contract.address} />
        <Chip sx={{ marginLeft: 2 }} label={contract.name} />
      </AccordionSummary>
      {contract.abi && (
        <AccordionDetails>
          <ABIForm address={contract.address} abi={contract.abi} />
        </AccordionDetails>
      )}
    </Accordion>
  );
}

function AddressInput() {
  const schema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid format"),
  });

  const add = useContracts((s) => s.add);

  const {
    handleSubmit,
    formState: { isValid, errors },
    register,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FieldValues) => {
    add(data.address);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Contract Address"
          error={!!errors.address}
          helperText={errors.address?.message?.toString() || ""}
          fullWidth
          {...register("address")}
        />
        <Button variant="contained" type="submit" disabled={!isValid}>
          Add
        </Button>
      </Stack>
    </form>
  );
}
