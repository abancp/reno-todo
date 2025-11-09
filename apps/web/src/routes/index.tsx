import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "../utils/auth-client";
import { useTasks } from "../hooks/useTasks";
import { useAddTask } from "../hooks/useAddTask";
import { FormEvent } from "react";
import { useToggleTask } from "../hooks/useToggleTask";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { Card, CardHeader, CardContent } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { Spinner } from "@repo/ui/spinner";
import { useEditTask } from "../hooks/useEditTask";
import { EditableTaskTitle } from "../components/EditableTaskTitle";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: session } = useSession();
  return session ? <TodoApp /> : <Landing />;
}

function Landing() {
  return <>Landing</>;
}

function TodoApp() {
  const { data: tasks, isLoading } = useTasks();
  const addTask = useAddTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const editTask = useEditTask();

  const handleAddTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    addTask.mutate(form.get("title") as string);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="w-88 shadow-sm border">
        <CardHeader>
          <h1 className="text-lg font-semibold">My Tasks</h1>
        </CardHeader>

        <CardContent className="space-y-4 w-full">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              name="title"
              placeholder="Enter task..."
              className="flex-1"
            />
            <Button type="submit" disabled={addTask.isPending}>
              Add
            </Button>
          </form>

          {isLoading ? (
            <div className="w-full flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {tasks?.map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center gap-2 p-2 rounded-md hover:bg-accent transition"
                >
                  <div className="flex gap-2 items-center">
                    {toggleTask.isPending ? (
                      <Spinner size={18} />
                    ) : (
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask.mutate(task.id)}
                        disabled={toggleTask.isPending}
                      />
                    )}

                    <EditableTaskTitle
                      id={task.id}
                      title={task.title}
                      completed={task.completed}
                      onSave={(newTitle) =>
                        editTask.mutate({ id: task.id, title: newTitle })
                      }
                      loading={editTask.loadingIds.has(task.id)}
                    />
                  </div>

                  {deleteTask.loadingIds.has(task.id) ? (
                    <Spinner size={15} />
                  ) : (
                    <svg
                      onClick={() =>
                        confirm("Are you sure to delete?") &&
                        deleteTask.mutate(task.id)
                      }
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      className="bi bi-trash text-red-700 cursor-pointer hover:text-red-600"
                      viewBox="0 0 18 18"
                    >
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
