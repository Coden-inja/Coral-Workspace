import type { AiAnalysisSnapshot } from "@/contracts/ai-analysis";
import { getMockAiAnalysisSnapshot } from "@/services/mock/ai-analysis";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAiAnalysisSnapshot(): Promise<AiAnalysisSnapshot> {
  await delay(200);
  return getMockAiAnalysisSnapshot();
}
