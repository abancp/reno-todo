import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../utils/hono-client";
import { ApiResponse, Task } from "@repo/types";
import { toast } from "@repo/ui/toast";
import { useState } from "react";

export function useToggleTask() {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: async (id: string): Promise<Task> => {
      setLoadingIds((prev) => new Set(prev).add(id));
      const res = await client.tasks[":id"].$patch({ param: { id } });
      const { data } = (await res.json()) as ApiResponse<Task>;
      return data;
    },
    onSettled: (_, __, id) => {
      setLoadingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  return { ...mutate, loadingIds };
}
