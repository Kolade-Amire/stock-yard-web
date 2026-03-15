import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry(failureCount, error) {
          if (error instanceof Error && "status" in error) {
            const status = error.status;

            if (typeof status === "number" && status >= 400 && status < 500 && status !== 429) {
              return false;
            }
          }

          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}
