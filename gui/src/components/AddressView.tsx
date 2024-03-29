import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, TextField } from "@mui/material";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import truncateEthAddress from "truncate-eth-address";
import { Address, getAddress } from "viem";
import { z } from "zod";

import { Typography } from "@ethui/react/components";
import { useInvoke } from "@/hooks";
import { ContextMenuWithTauri, Modal } from "./";
import { useNetworks } from "@/store";
import { IconAddress } from "./Icons";

interface Props {
  address: Address;
  copyIcon?: boolean;
  mono?: boolean;
  contextMenu?: boolean;
  variant?: "h6";
  icon?: boolean;
}

export function AddressView({
  address: addr,
  mono = false,
  contextMenu = true,
  variant,
  icon = false,
}: Props) {
  const network = useNetworks((s) => s.current);
  const address = getAddress(addr);
  const { data: alias, refetch } = useInvoke<string>("settings_get_alias", {
    address,
  });
  const [aliasFormOpen, setAliasFormOpen] = useState(false);

  if (!network) return;

  const text = alias ? alias : truncateEthAddress(`${address}`);
  const content = (
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon && (
        <IconAddress
          chainId={network.chain_id}
          address={address}
          size="small"
          effigy
        />
      )}
      <Typography mono={mono} variant={variant}>
        {text}
      </Typography>
    </Stack>
  );

  if (!contextMenu) return content;

  return (
    <ContextMenuWithTauri
      copy={address}
      actions={[
        {
          label: "Open in explorer",
          href: `${network.explorer_url}${address}`,
        },
        { label: "Set alias", action: () => setAliasFormOpen(true) },
        {
          label: "Clear alias",
          action: () => setAliasFormOpen(true),
          disabled: !alias,
        },
      ]}
      sx={{ textTransform: "none" }}
    >
      {content}

      <Modal open={aliasFormOpen} onClose={() => setAliasFormOpen(false)}>
        <AliasForm
          {...{ address, alias, refetch }}
          onSubmit={() => setAliasFormOpen(false)}
        />
      </Modal>
    </ContextMenuWithTauri>
  );
}

const schema = z.object({
  alias: z.string().optional(),
});

interface AliasFormProps {
  address: string;
  alias?: string;
  refetch: () => void;
  onSubmit: () => void;
}

function AliasForm({ address, alias, refetch, onSubmit }: AliasFormProps) {
  const {
    handleSubmit,
    register,
    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const submit = (data: FieldValues) => {
    invoke("settings_set_alias", { address, alias: data.alias });
    refetch();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack alignItems="flex-start" spacing={2}>
        <Typography>Set alias for {truncateEthAddress(address)}</Typography>
        <TextField
          label="Alias"
          defaultValue={alias}
          error={!!errors.alias}
          helperText={errors.alias?.message?.toString() || ""}
          fullWidth
          {...register("alias")}
        />

        <Button
          variant="contained"
          type="submit"
          disabled={!isDirty || !isValid}
        >
          Save
        </Button>
      </Stack>
    </form>
  );
}
