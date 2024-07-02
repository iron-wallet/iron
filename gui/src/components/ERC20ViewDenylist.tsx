import { useState } from "react";
import {
  Stack,
  IconButton,
  Card,
  CardHeader,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { type Address, formatUnits } from "viem";
import { invoke } from "@tauri-apps/api";

import { AddressView, CopyToClipboard, Modal, TransferForm } from ".";
import { IconAddress } from "./Icons";
import { useNetworks } from "@/store";

interface Props {
  chainId: number;
  contract?: Address;
  symbol?: string;
  balance: bigint;
  decimals?: number;
}

const minimum = 0.001;

export function ERC20ViewDenylist({
  chainId,
  contract,
  symbol,
  balance,
  decimals,
}: Props) {
  const [transferFormOpen, setTransferFormOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const network = useNetworks((s) => s.current);

  if (!symbol || !decimals || !network) return null;

  const truncatedBalance =
    balance - (balance % BigInt(Math.ceil(minimum * 10 ** decimals)));

  const onMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setMenuAnchor(event.currentTarget);

  const allowlist = () => {
    invoke("db_set_erc20_allowlist", {
      chainId: network.chain_id,
      address: contract,
    });
    setMenuAnchor(null);
  };

  return (
    <Card elevation={0}>
      <CardHeader
        avatar={<IconAddress chainId={chainId} address={contract} />}
        action={
          <Stack direction="row">
            <IconButton aria-label="more" onClick={onMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Stack>
        }
        title={
          <>
            <Box component="span" sx={{ mr: 1 }}>
              {symbol}
            </Box>
            {contract && (
              <>
                (<AddressView address={contract} />)
              </>
            )}
          </>
        }
        subheader={
          <CopyToClipboard label={balance.toString()}>
            {truncatedBalance > 0
              ? formatUnits(truncatedBalance, decimals)
              : `< ${minimum}`}
          </CopyToClipboard>
        }
      />

      <Menu
        open={Boolean(menuAnchor)}
        id={`erc20-${contract}-menu`}
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        {contract && network?.explorer_url && (
          <MenuItem
            component="a"
            target="_blank"
            href={`${network.explorer_url}${contract}`}
            onClick={() => setMenuAnchor(null)}
          >
            Open on explorer
          </MenuItem>
        )}
        <MenuItem onClick={allowlist}>Allowlist token</MenuItem>
      </Menu>

      <Modal open={transferFormOpen} onClose={() => setTransferFormOpen(false)}>
        <TransferForm
          contract={contract}
          onClose={() => setTransferFormOpen(false)}
        />
      </Modal>
    </Card>
  );
}