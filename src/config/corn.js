import cron from "node-cron";
import Todo from "../models/todo.model.js";

const startTodoCleanupCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const expiryDate = new Date(Date.now() - THIRTY_DAYS);

      const result = await Todo.deleteMany({
        isTrashed: true,
        deletedAt: { $lte: expiryDate },
      });

      console.log(`🗑️ Auto-deleted ${result.deletedCount} todos`);
    } catch (error) {
      console.error("Cron delete error:", error);
    }
  });

  console.log("🕒 Todo cleanup cron started");
};

export default startTodoCleanupCron;
