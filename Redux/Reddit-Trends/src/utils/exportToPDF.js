import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportElementToPDF(element, filename = "export.pdf") {
  if (!element) return;

  // Clone the element into a clean container
  const clone = element.cloneNode(true);
  const container = document.createElement("div");

  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.zIndex = "-1";
  container.style.background = "white";
  container.style.padding = "0";
  container.style.margin = "0";

  container.appendChild(clone);
  document.body.appendChild(container);

  // Force exact layout size
  const cssWidth = element.offsetWidth;
  const cssHeight = element.offsetHeight;

  clone.style.width = cssWidth + "px";
  clone.style.height = cssHeight + "px";

  // Render clean clone
  const canvas = await html2canvas(clone, {
    scale: window.devicePixelRatio || 1,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL("image/png");

  // Convert px → pt (PDF uses 72 DPI)
  const pdfWidth = canvas.width * 0.75;
  const pdfHeight = canvas.height * 0.75;

  const pdf = new jsPDF({
    orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
    unit: "pt",
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
