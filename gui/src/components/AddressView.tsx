import { zodResolver } from "@hookform/resolvers/zod";
import { ContentCopySharp } from "@mui/icons-material";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import truncateEthAddress from "truncate-eth-address";
import { z } from "zod";

import { post } from "@/api";
import { useApi } from "@/hooks";

import { ContextMenu, Modal } from "./";

interface Props {
  address: string;
  contextMenu?: boolean;
  copyIcon?: boolean;
}

export function AddressView({ contextMenu, address, copyIcon }: Props) {
  const { data: alias, mutate } = useApi<string>("/settings/alias", {
    address,
  });
  const [aliasFormOpen, setAliasFormOpen] = useState(false);

  const contextActions = [
    { label: "Set alias", action: () => setAliasFormOpen(true) },
    {
      label: "Clear alias",
      action: () => {
        post("/settings/alias", { address, alias: null });
        mutate();
      },
      disabled: !alias,
    },
  ];

  const content = (
    <>
      {alias ? alias : truncateEthAddress(`${address}`)}
      {copyIcon && <ContentCopySharp fontSize="small" sx={{ ml: 1 }} />}
    </>
  );

  return (
    <>
      {!contextMenu && (
        <Box fontSize="inherit" title={address}>
          {content}
        </Box>
      )}

      {contextMenu && (
        <>
          <ContextMenu
            copy={address}
            explorer={address}
            actions={contextActions}
            sx={{ textTransform: "none" }}
          >
            {content}
          </ContextMenu>

          <Modal open={aliasFormOpen} onClose={() => setAliasFormOpen(false)}>
            <AliasForm
              {...{ address, alias, mutate }}
              onSubmit={() => setAliasFormOpen(false)}
            />
          </Modal>
        </>
      )}
    </>
  );
}

AddressView.defaultProps = {
  contextMenu: true,
  copyIcon: false,
};

const schema = z.object({
  alias: z.string().optional(),
});

interface AliasFormProps {
  address: string;
  alias?: string;
  mutate: () => void;
  onSubmit: () => void;
}

function AliasForm({ address, alias, mutate, onSubmit }: AliasFormProps) {
  const {
    handleSubmit,
    register,
    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const submit = (data: FieldValues) => {
    post("/settings/alias", { address, alias: data.alias });
    mutate();
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
