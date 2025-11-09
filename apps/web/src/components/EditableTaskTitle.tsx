import { useState } from "react";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Spinner } from "@repo/ui/spinner";

type Props = {
  id: string;
  title: string;
  completed: boolean;
  onSave: (newTitle: string) => void;
  loading: boolean;
};

export function EditableTaskTitle({
  title,
  completed,
  onSave,
  loading,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  const finish = () => {
    const newTitle = value.trim();
    setEditing(false);
    if (newTitle && newTitle !== title) onSave(newTitle);
    else setValue(title);
  };

  if (loading) {
    return <Spinner size={18} />;
  }

  if (editing) {
    return (
      <Input
        autoFocus
        className="h-7 w-full"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === "Enter") finish();
          if (e.key === "Escape") {
            setValue(title);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <Label
      onDoubleClick={() => setEditing(true)}
      className={
        completed
          ? "line-through text-muted-foreground cursor-text"
          : "cursor-text"
      }
    >
      {title}
    </Label>
  );
}
