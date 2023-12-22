import { Avatar } from "@mui/material";
import { Adb, Delete, Usb } from "@mui/icons-material";

export interface IconChainProps extends React.ComponentProps<typeof Avatar> {
  type: string;
  size?: "small" | "medium" | "large";
}

export function IconWalletType({
  type,
  size = "medium",
  ...props
}: IconChainProps) {
  let width = 24;
  if (size === "small") width = 16;
  if (size === "large") width = 40;

  let content;

  switch (type) {
    case "plaintext":
      content = <Adb />;
      break;
    case "HDWallet":
      break;
    case "jsonKeystore":
      break;
    case "impersonator":
      break;
    case "ledger":
      content = <Usb />;
      break;
    case "privateKey":
      content = <>0x</>;
      break;
    default:
      content = <Delete />;
      break;
  }

  return (
    <Avatar sx={{ width, height: width }} {...props}>
      {content}
    </Avatar>
  );
}
