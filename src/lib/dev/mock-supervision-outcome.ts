import { computeFocusCoinsEarned } from "@/lib/supervision-rewards";
import {
  buildOutcomeStats,
  type DistractionStrikeRecord,
  type SupervisionOutcomeModalState,
} from "@/lib/supervision-outcome";

/** 三段任务、第三段完成并整任务通关（本地预览用） */
export function createMockTaskSuccessOutcome(options?: {
  taskText?: string;
  officerName?: string;
  totalBlocks?: number;
  distractions?: DistractionStrikeRecord[];
  totalCoins?: number;
  totalSessions?: number;
}): SupervisionOutcomeModalState {
  const totalBlocks = options?.totalBlocks ?? 3;
  const currentBlockNumber = totalBlocks;
  const distractions = options?.distractions ?? [
    {
      strikeIndexInBlock: 1,
      blockNumber: 2,
      reason: "检测到手机",
    },
  ];
  const coinsEarned = computeFocusCoinsEarned(totalBlocks, distractions);

  return {
    kind: "task-success",
    recordSaved: true,
    stats: buildOutcomeStats({
      taskText: options?.taskText ?? "语文作文",
      officerName: options?.officerName ?? "尤里教官",
      totalBlocks,
      completedBlocks: totalBlocks,
      currentBlockNumber,
      distractions,
      totalDistractions: distractions.length,
      coinsEarned,
      totalCoins: options?.totalCoins ?? 42,
      totalSessions: options?.totalSessions ?? 12,
    }),
  };
}

/** 三段任务、第二段完成（段间休息，非整任务通关） */
export function createMockBlockSuccessOutcome(options?: {
  taskText?: string;
  officerName?: string;
  currentBlockNumber?: number;
  totalBlocks?: number;
}): SupervisionOutcomeModalState {
  const totalBlocks = options?.totalBlocks ?? 3;
  const currentBlockNumber = options?.currentBlockNumber ?? 2;

  return {
    kind: "block-success",
    breakSecondsUntilNext: 300,
    nextBlockLabel: `第 ${currentBlockNumber + 1} 段专注`,
    nextBlockStartLabel: "14:35",
    stats: buildOutcomeStats({
      taskText: options?.taskText ?? "语文作文",
      officerName: options?.officerName ?? "尤里教官",
      totalBlocks,
      completedBlocks: currentBlockNumber,
      currentBlockNumber,
      distractions: [],
      totalDistractions: 0,
    }),
  };
}
