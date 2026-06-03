import { useState, useCallback } from "react";
import { ProductData } from "@/types/product";
import { AuditEntry, ProductVersion } from "@/types/audit";

export const useProductHistory = () => {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [versions, setVersions] = useState<ProductVersion[]>([]);

  const addAuditEntry = useCallback((entry: Omit<AuditEntry, "id" | "timestamp">) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setAuditTrail((prev) => [newEntry, ...prev]);
  }, []);

  const saveVersion = useCallback((productData: ProductData, description: string) => {
    const newVersion: ProductVersion = {
      version: versions.length + 1,
      timestamp: new Date(),
      snapshot: JSON.stringify(productData),
      description,
    };
    setVersions((prev) => [...prev, newVersion]);
  }, [versions.length]);

  const getVersion = useCallback((version: number): ProductData | null => {
    const productVersion = versions.find((v) => v.version === version);
    if (productVersion) {
      return JSON.parse(productVersion.snapshot);
    }
    return null;
  }, [versions]);

  const exportAuditTrail = useCallback(() => {
    const csvRows: string[][] = [["Timestamp", "Action", "Field", "Old Value", "New Value", "Description"]];
    
    auditTrail.forEach((entry) => {
      csvRows.push([
        entry.timestamp.toISOString(),
        entry.action,
        entry.field || "",
        entry.oldValue || "",
        entry.newValue || "",
        entry.description,
      ]);
    });

    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `audit_trail_${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [auditTrail]);

  return {
    auditTrail,
    versions,
    addAuditEntry,
    saveVersion,
    getVersion,
    exportAuditTrail,
  };
};
