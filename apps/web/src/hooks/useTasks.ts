import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Task } from "@repo/types";
import { client } from "../utils/hono-client";

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await client.tasks.$get();
      const { data } = (await res.json()) as ApiResponse<Task[]>;
      return data;
    },
  });
}
