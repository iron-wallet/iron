import { Suspense } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { GlobalStyles, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ErrorHandler } from "@/components";
import { useTheme } from "@/store/theme";

const queryClient = new QueryClient();

const globalStyles = {
  body: { userSelect: "none" },
  p: { userSelect: "initial" },
  h1: { userSelect: "initial" },
  h2: { userSelect: "initial" },
  h3: { userSelect: "initial" },
};

export const Route = createRootRoute({
  component: () => <Root />,
});

function Root() {
  const theme = useTheme((s) => s.theme);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={globalStyles} />
      <CssBaseline>
        <ErrorHandler>
          <QueryClientProvider client={queryClient}>
            <Suspense>
              <Outlet />
            </Suspense>
          </QueryClientProvider>
        </ErrorHandler>
      </CssBaseline>
    </ThemeProvider>
  );
}
