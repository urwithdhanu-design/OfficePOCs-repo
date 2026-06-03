export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: "created" | "updated" | "feature_added" | "feature_removed" | "feature_updated" | "system_updated";
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

export interface ProductVersion {
  version: number;
  timestamp: Date;
  snapshot: string; // JSON snapshot of product data
  description: string;
}
