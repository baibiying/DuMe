import { notFound } from "next/navigation";
import { SupervisionOutcomeDevPreview } from "./supervision-outcome-dev-preview";

/** 本地预览监督结算 UI（生产环境不可访问） */
export default function DevSupervisionOutcomePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <SupervisionOutcomeDevPreview />;
}
