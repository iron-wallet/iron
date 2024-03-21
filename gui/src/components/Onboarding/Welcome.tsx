import { Box, Button, Link, Stack, Typography } from "@mui/material";

import { StepProps } from ".";

export function WelcomeStep({ onSubmit }: StepProps) {
  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      <Typography variant="h6" component="h1" alignSelf="start">
        Welcome
      </Typography>
      <Typography component="p">
        EthUI is an Ethereum wallet for developers. Check out{" "}
        <Link
          underline="hover"
          href="https://mirror.xyz/ethui.eth"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          our website
        </Link>{" "}
        to learn more, or check out the&nbsp;
        <Link
          underline="hover"
          href="https://mirror.xyz/ethui.eth"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          source code on Github
        </Link>
        .
        <br />
        Contributors are welcome!
      </Typography>
      <Box alignSelf="flex-end">
        <Button variant="contained" type="submit" onClick={onSubmit}>
          Next
        </Button>
      </Box>
    </Stack>
  );
}
