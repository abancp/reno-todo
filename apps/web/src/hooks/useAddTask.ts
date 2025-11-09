import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../utils/hono-client";
import { ApiResponse, Task } from "@repo/types";
import { toast } from "@repo/ui/toast";

export function useAddTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string): Promise<Task> => {
      const res = await client.tasks.$post({ json: { title } });
      const { data } = (await res.json()) as ApiResponse<Task>;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
}
