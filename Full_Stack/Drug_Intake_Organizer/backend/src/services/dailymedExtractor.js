export function extractInteractionsFromSplXml(xml) {
  if (!xml || !xml.document || !xml.document.section) return [];

  const sections = xml.document.section;
  const warnings = [];

  const addIfPresent = (title, content) => {
    if (content && typeof content === "string" && content.trim().length > 0) {
      warnings.push(`${title}: ${content.trim()}`);
    }
  };

  sections.forEach(sec => {
    const title = sec.title?.toLowerCase() || "";

    if (title.includes("drug interactions")) {
      addIfPresent("Drug Interactions", sec.text);
    }

    if (title.includes("warnings")) {
      addIfPresent("Warnings", sec.text);
    }

    if (title.includes("contraindications")) {
      addIfPresent("Contraindications", sec.text);
    }

    if (title.includes("alcohol")) {
      addIfPresent("Alcohol Interaction", sec.text);
    }

    if (title.includes("food")) {
      addIfPresent("Food Interaction", sec.text);
    }
  });

  return warnings;
}