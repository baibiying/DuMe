import type { TaskPerformanceReport } from "@/lib/task-performance";

/** 战绩卷轴本地预览：1 成功、1 失败、4 专注币 */
export function createMockTaskPerformanceReport(): TaskPerformanceReport {
  const now = new Date().toISOString();
  const earlier = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  return {
    totalCoins: 4,
    successCount: 1,
    failureCount: 1,
    successes: [
      {
        taskId: 900001,
        taskText: "[战绩演示] 语文作文",
        scheduledStartAt: earlier,
        scheduledEndAt: now,
        at: earlier,
        coinsEarned: 4,
        distractionCount: 1,
      },
    ],
    failures: [
      {
        taskId: 900002,
        taskText: "[战绩演示] 高数复习",
        scheduledStartAt: earlier,
        scheduledEndAt: now,
        at: now,
        reason: "supervision_failed",
        coinsEarned: 0,
        distractionCount: 3,
      },
    ],
  };
}

export function isDevPerformanceDemoEnabled() {
  return process.env.NEXT_PUBLIC_DEV_PERFORMANCE_DEMO === "1";
}
