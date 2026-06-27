/**
 * 本地战绩卷轴演示数据：1 任务成功、1 任务失败、共 4 专注币。
 *
 * 用法：
 *   bun scripts/seed-local-performance-scroll.ts
 *   bun scripts/seed-local-performance-scroll.ts your@email.com
 *
 * 需已启动本地 Postgres（docker compose up -d）且 .env 中 DATABASE_URL 正确。
 */
import { config } from "dotenv";
import { and, eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabaseUrl } from "../src/lib/db/connection-url";
import { focusSessions, tasks, userStats, users } from "../src/lib/db/schema";

config({ path: ".env" });

const DEMO_PREFIX = "[战绩演示]";
const DEMO_SUCCESS_TEXT = `${DEMO_PREFIX} 语文作文`;
const DEMO_FAILURE_TEXT = `${DEMO_PREFIX} 高数复习`;
const DEMO_TOTAL_COINS = 4;

async function resolveUserId(db: ReturnType<typeof drizzle>, emailArg?: string) {
  if (emailArg?.trim()) {
    const rows = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, emailArg.trim().toLowerCase()))
      .limit(1);
    if (rows[0]) return rows[0];
    throw new Error(`未找到用户：${emailArg}`);
  }

  const all = await db.select({ id: users.id, email: users.email }).from(users).limit(1);
  if (all[0]) return all[0];
  throw new Error("数据库中尚无用户，请先本地注册登录后再运行本脚本。");
}

async function clearPreviousDemo(
  db: ReturnType<typeof drizzle>,
  userId: string
) {
  const demoTasks = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), like(tasks.text, `${DEMO_PREFIX}%`)));

  const demoTaskIds = demoTasks.map((row) => row.id);
  if (demoTaskIds.length === 0) return;

  await db
    .delete(focusSessions)
    .where(
      and(eq(focusSessions.userId, userId), inArray(focusSessions.taskId, demoTaskIds))
    );
  await db.delete(tasks).where(inArray(tasks.id, demoTaskIds));
}

async function main() {
  const emailArg = process.argv[2];
  const sql = postgres(resolveDatabaseUrl(), { max: 1 });
  const db = drizzle(sql);

  try {
    const user = await resolveUserId(db, emailArg);
    console.log(`⏳ 为用户 ${user.email ?? user.id} 写入战绩演示数据…`);

    await clearPreviousDemo(db, user.id);

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [successTask] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        text: DEMO_SUCCESS_TEXT,
        durationMinutes: 75,
        category: "import-urgent",
        checked: true,
        scheduledStartAt: yesterday,
        scheduledEndAt: now,
      })
      .returning();

    const [failureTask] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        text: DEMO_FAILURE_TEXT,
        durationMinutes: 50,
        category: "urgent-not-important",
        checked: false,
        scheduledStartAt: yesterday,
        scheduledEndAt: now,
      })
      .returning();

    await db.insert(focusSessions).values([
      {
        userId: user.id,
        taskId: successTask.id,
        officerId: "yuri",
        outcome: "completed",
        durationMinutes: 25,
        completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        coinsEarned: DEMO_TOTAL_COINS,
        distractionCount: 1,
      },
      {
        userId: user.id,
        taskId: failureTask.id,
        officerId: "yuri",
        outcome: "failed",
        durationMinutes: 25,
        completedAt: new Date(now.getTime() - 60 * 60 * 1000),
        coinsEarned: 0,
        distractionCount: 3,
      },
    ]);

    const existingStats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, user.id))
      .limit(1);

    if (existingStats[0]) {
      await db
        .update(userStats)
        .set({
          totalCoins: DEMO_TOTAL_COINS,
          totalSessions: Math.max(existingStats[0].totalSessions, 2),
          updatedAt: now,
        })
        .where(eq(userStats.userId, user.id));
    } else {
      await db.insert(userStats).values({
        userId: user.id,
        totalCoins: DEMO_TOTAL_COINS,
        totalSessions: 2,
        consecutiveDays: 1,
        lastSessionDate: now,
        unlockedBadges: ["exam_badge"],
      });
    }

    console.log("✅ 战绩演示数据已写入：");
    console.log(`   · 成功 1：${DEMO_SUCCESS_TEXT}（+${DEMO_TOTAL_COINS} 专注币）`);
    console.log(`   · 失败 1：${DEMO_FAILURE_TEXT}`);
    console.log(`   · 专注币合计：${DEMO_TOTAL_COINS}`);
    console.log("");
    console.log("请本地登录同一账号，打开首页 → 战绩卷轴（或 ?scene=performance）并刷新页面。");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("❌ 写入失败");
  console.error(err);
  process.exit(1);
});
