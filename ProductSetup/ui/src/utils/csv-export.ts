import { ProductData } from "@/types/product";

export const exportToCSV = (productData: ProductData) => {
  const rows: string[][] = [];
  
  // Header
  rows.push(["Section", "Field", "Value"]);
  
  // Basic Info
  rows.push(["Basic Info", "Product Name", productData.productName]);
  rows.push(["Basic Info", "Brands", productData.brands.map(b => b.toUpperCase()).join(", ")]);
  rows.push(["Basic Info", "Additional Cardholders", productData.additionalCardholders.toString()]);
  
  // Features
  rows.push([]);
  rows.push(["Features", "Feature Code", "Feature Name", "Category", "Value", "Effective Date", "Priority", "Notes"]);
  productData.features.forEach(feature => {
    rows.push([
      "Features",
      feature.code,
      feature.name,
      feature.category,
      feature.value || "",
      feature.effectiveDate || "",
      feature.priority?.toString() || "",
      feature.notes || ""
    ]);
  });
  
  // External Systems
  rows.push([]);
  rows.push(["External Systems", "System", "ID", "Name"]);
  productData.externalSystems.forEach(system => {
    rows.push([
      "External Systems",
      system.system,
      system.id,
      system.name || ""
    ]);
  });
  
  // Convert to CSV string
  const csvContent = rows
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");
  
  // Create and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${productData.productName.replace(/\s+/g, "_")}_config.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
