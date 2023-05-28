import { zodResolver } from "@hookform/resolvers/zod";
import {
  Backdrop,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import { useDialog } from "../hooks/useDialog";
import Panel from "./Panel";

interface Request {
  name: string;
  file: string;
}

const schema = z.object({ password: z.string() });

export function JsonKeystoreUnlockDialog({ id }: { id: number }) {
  const { data, send, reject, listen } = useDialog<Request>(id);
  const {
    handleSubmit,
    register,
    formState: { isDirty, isValid },
  } = useForm({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(3);

  // listen to failure events
  useEffect(() => {
    const unlisten = listen("failed", () => {
      setAttempts(attempts - 1);
      setLoading(false);
    });

    return () => {
      unlisten.then((cb) => cb());
    };
  }, [attempts]);

  if (!data) return null;

  const { name } = data;

  console.log(data);
  const onSubmit = (data: FieldValues) => {
    console.log(data);
    send(data);
    setLoading(true);
  };

  return (
    <Panel>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Stack spacing={2}>
          <Typography>
            Iron Wallet is asking to unlock wallet <b>{name}:</b>
          </Typography>

          <TextField
            label="Password"
            helperText={
              attempts !== 3 && `Incorrect password, ${attempts} attempts left`
            }
            fullWidth
            {...register("password")}
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              type="submit"
              disabled={!isDirty || !isValid}
            >
              Unlock
            </Button>
            <Button variant="contained" color="error" onClick={() => reject()}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </form>
      <Backdrop open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Panel>
  );
}
