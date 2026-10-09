import { getExternalInteractionsForItem } from "./externalDataService.js";

export async function analyzeInteractions(items) {
  const results = [];

  for (const item of items) {
    const internalWarnings = [];
    const internalSources = [];

    const name = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();

    // Internal rules (same as before)
    if (name.includes("magnesium")) {
      internalWarnings.push("Magnesium can increase bowel motility at higher doses.");
      internalSources.push("Internal rule: magnesium GI effects");
    }

    if (name.includes("vitamin d")) {
      internalWarnings.push("High-dose Vitamin D should be monitored with calcium intake.");
      internalSources.push("Internal rule: vitamin D + calcium");
    }

    if (category === "supplement") {
      internalWarnings.push("Supplements may interact with medications; verify with a clinician or pharmacist.");
      internalSources.push("Internal rule: general supplement caution");
    }

    // External (hybrid) warnings
    const externalWarnings = await getExternalInteractionsForItem(item);

    results.push({
      item_id: item.id,
      name: item.name,
      warnings: [...internalWarnings, ...(externalWarnings || [])],
      sources: [...internalSources, ...(externalWarnings?.map(() => "External hybrid source") || [])]
    });
  }

  return results;
}