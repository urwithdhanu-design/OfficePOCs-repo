import { ProductData } from "./product";

export type RecordStatus = "pending" | "approved" | "rejected";

export interface ProductRecord {
  id: string;
  productData: ProductData;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  submittedBy?: string;
  submittedByUserId?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}
