import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Renders a DOM element to a canvas and saves it as a single-page-scaled PDF.
export async function exportElementToPDF(element, filename = "export.pdf") {
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}
