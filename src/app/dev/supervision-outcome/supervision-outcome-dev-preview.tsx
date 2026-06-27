"use client";

import { useCallback, useMemo, useState } from "react";
import { SupervisionOutcomeModal } from "@/components/screens/monitor/supervision-outcome-modal";
import type { SupervisionOutcomeModalState } from "@/lib/supervision-outcome";
import {
  createMockBlockSuccessOutcome,
  createMockTaskSuccessOutcome,
} from "@/lib/dev/mock-supervision-outcome";

type PreviewKey = "task-success" | "block-success";

const PRESETS: Record<
  PreviewKey,
  { label: string; description: string; build: () => SupervisionOutcomeModalState }
> = {
  "task-success": {
    label: "任务通关（3/3 段）",
    description: "第三段专注完成，整任务成功结算",
    build: createMockTaskSuccessOutcome,
  },
  "block-success": {
    label: "本段完成（2/3 段）",
    description: "第二段完成，进入段间休息（对照用）",
    build: createMockBlockSuccessOutcome,
  },
};

export function SupervisionOutcomeDevPreview() {
  const [preset, setPreset] = useState<PreviewKey>("task-success");
  const [outcome, setOutcome] = useState<SupervisionOutcomeModalState | null>(() =>
    createMockTaskSuccessOutcome()
  );

  const activePreset = PRESETS[preset];

  const openPreset = useCallback((key: PreviewKey) => {
    setPreset(key);
    setOutcome(PRESETS[key].build());
  }, []);

  const scenarioSummary = useMemo(() => {
    if (!outcome) return null;
    const { stats } = outcome;
    return {
      segment: `${stats.currentBlockNumber} / ${stats.totalBlocks}`,
      completed: stats.completedBlocks,
      coins: stats.coinsEarned,
    };
  }, [outcome]);

  return (
    <div className="relative min-h-[70vh]">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
          Dev only · /dev/supervision-outcome
        </p>
        <h1 className="font-bangers text-3xl text-[#1C1917]">监督结算页预览</h1>
        <p className="text-base font-bold text-neutral-700 leading-relaxed">
          默认展示：<strong>任务共 3 段</strong>，当前为<strong>第 3 段（最后一段）</strong>
          完成后的<strong>任务通关</strong>界面。关闭弹窗后可切换其它预设重新打开。
        </p>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESETS) as PreviewKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => openPreset(key)}
              className={[
                "rounded-lg border-2 border-[#1C1917] px-3 py-2 text-sm font-bold transition-colors",
                preset === key
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-[#1C1917] hover:bg-amber-50",
              ].join(" ")}
            >
              {PRESETS[key].label}
            </button>
          ))}
        </div>

        <p className="text-sm text-neutral-600">{activePreset.description}</p>

        {scenarioSummary && (
          <dl className="grid grid-cols-3 gap-2 rounded-lg border-2 border-[#1C1917] bg-amber-50/80 p-3 text-sm font-bold">
            <div>
              <dt className="text-neutral-500">当前段</dt>
              <dd className="font-mono text-lg">{scenarioSummary.segment}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">已完成段数</dt>
              <dd className="font-mono text-lg">{scenarioSummary.completed}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">专注币</dt>
              <dd className="font-mono text-lg">{scenarioSummary.coins ?? "—"}</dd>
            </div>
          </dl>
        )}

        {!outcome && (
          <button
            type="button"
            onClick={() => openPreset(preset)}
            className="rounded-lg border-2 border-[#1C1917] bg-emerald-500 px-4 py-2 font-bold text-white"
          >
            重新打开结算弹窗
          </button>
        )}
      </div>

      <SupervisionOutcomeModal
        outcome={outcome}
        onDismiss={() => setOutcome(null)}
        onStartBreak={() => setOutcome(null)}
      />
    </div>
  );
}
