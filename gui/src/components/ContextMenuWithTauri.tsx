import * as tauri from "@tauri-apps/api";

import { ContextMenu, ContextMenuProps } from "@ethui/react/components";

export interface ContextMenuWithTauriProps extends ContextMenuProps {}

export function ContextMenuWithTauri(props: ContextMenuWithTauriProps) {
  return <ContextMenu clipboard={tauri.clipboard} {...props} />;
}
