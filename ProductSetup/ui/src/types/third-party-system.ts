export type SystemApprovalStatus = "pending" | "approved" | "rejected" | "in_review";

export interface ThirdPartySystemApproval {
  id: string;
  systemName: string;
  status: SystemApprovalStatus;
  lastUpdated: string;
  updatedBy?: string;
  notes?: string;
}

export interface ProductSystemApprovals {
  productRecordId: string;
  systems: ThirdPartySystemApproval[];
}

export const THIRD_PARTY_SYSTEMS = [
  "Core Banking System",
  "Credit Bureau Integration",
  "Fraud Detection System",
  "Payment Gateway",
  "KYC/AML System",
  "Card Management System",
  "Rewards Platform",
  "Statement Generation",
  "Mobile Banking API",
  "Customer Data Platform",
];
