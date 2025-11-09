import { Hono } from "hono";
import { type HonoAppContext } from "../auth";
import { withAuth } from "../middlewares/auth.middleware";
import { db, task } from "../db";
import { err, ok } from "../utils/response";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const updateTaskSchema = z.object({
  title: z.string(),
});

export const taskRoute = new Hono<HonoAppContext<"IsAuthenticated">>()
  .use("*", withAuth)
  .get("/", async (c) => {
    try {
      const session = c.get("session");
      if (!session) return err("Unauthorized : Please Login", 401);
      const userid = session.userId;
      const rows = await db
        .select()
        .from(task)
        .where(eq(task.userid, userid))
        .orderBy(task.createdAt);
      return ok(rows);
    } catch {
      return err("Something went wrong!", 500);
    }
  })
  .post("/", async (c) => {
    try {
      const session = c.get("session");
      if (!session) return err("Unauthorized : Please Login", 401);
      const { title } = await c.req.json();
      const userid = session.userId;
      const id = crypto.randomUUID();

      await db.insert(task).values({
        id,
        userid,
        title,
        completed: false,
      });

      return ok({
        id,
        title,
        completed: false,
      });
    } catch {
      return err("Something went wrong!", 500);
    }
  })
  .patch("/:id", async (c) => {
    try {
      const session = c.get("session");
      if (!session) return err("Unauthorized : Please Login", 401);
      const id = c.req.param("id");
      const userid = session.userId;

      const [currentTask] = await db
        .select({
          id: task.id,
          completed: task.completed,
          title: task.title,
        })
        .from(task)
        .where(and(eq(task.id, id), eq(task.userid, userid)));

      if (!currentTask) return err("Task not found", 404);
      const newCompleted = !currentTask.completed;
      await db
        .update(task)
        .set({ completed: newCompleted })
        .where(and(eq(task.id, id), eq(task.userid, userid)));

      return ok({
        id,
        title: currentTask.title,
        completed: newCompleted,
      });
    } catch {
      return err("Something went wrong!", 500);
    }
  })
  .patch("/title/:id", zValidator("json", updateTaskSchema), async (c) => {
    try {
      const session = c.get("session");
      if (!session) return err("Unauthorized : Please Login", 401);
      const userid = session.userId;
      const id = c.req.param("id");
      const newTitle = (await c.req.json()).title;
      const [currentTask] = await db
        .select({
          id: task.id,
          completed: task.completed,
          title: task.title,
        })
        .from(task)
        .where(and(eq(task.id, id), eq(task.userid, userid)));

      if (!currentTask) return err("Task not found!", 404);

      await db
        .update(task)
        .set({ title: newTitle })
        .where(and(eq(task.id, id), eq(task.userid, userid)));

      return ok({
        id,
        title: newTitle,
        completed: currentTask.completed,
      });
    } catch {
      return err("Something went wrong!", 500);
    }
  })
  .delete("/:id", async (c) => {
    try {
      const session = c.get("session");
      if (!session) return err("Unauthorized : Please Login", 401);
      const userid = session.userId;
      const id = c.req.param("id");
      const [currentTask] = await db
        .select({
          id: task.id,
          completed: task.completed,
          title: task.title,
        })
        .from(task)
        .where(and(eq(task.id, id), eq(task.userid, userid)));
      if (!currentTask) return err("Task not found", 404);

      await db
        .delete(task)
        .where(and(eq(task.id, id), eq(task.userid, userid)));
      return ok({
        id,
        title: currentTask.title,
        completed: currentTask.completed,
      });
    } catch {
      return err("Something went wrong", 500);
    }
  });
