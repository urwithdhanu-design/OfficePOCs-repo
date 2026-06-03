import { ProductData } from "@/types/product";
import { ProductRecord, RecordStatus } from "@/types/product-record";

const STORAGE_KEY = "product_records";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get all records from localStorage
const getRecords = (): ProductRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Save records to localStorage
const saveRecords = (records: ProductRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

// Mock API endpoints
export const mockApi = {
  // Submit a new product configuration for review
  submitProduct: async (productData: ProductData, userId?: string, userEmail?: string): Promise<ProductRecord> => {
    await delay(500); // Simulate network delay

    const record: ProductRecord = {
      id: generateId(),
      productData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedBy: userEmail || "User",
      submittedByUserId: userId,
    };

    const records = getRecords();
    records.push(record);
    saveRecords(records);

    return record;
  },

  // Get records by user
  getRecordsByUser: async (userId: string): Promise<ProductRecord[]> => {
    await delay(300);
    const records = getRecords();
    return records.filter((r) => r.submittedByUserId === userId);
  },

  // Get all product records
  getAllRecords: async (): Promise<ProductRecord[]> => {
    await delay(300);
    return getRecords();
  },

  // Get records by status
  getRecordsByStatus: async (status: RecordStatus): Promise<ProductRecord[]> => {
    await delay(300);
    const records = getRecords();
    return records.filter((r) => r.status === status);
  },

  // Get a single record by ID
  getRecordById: async (id: string): Promise<ProductRecord | null> => {
    await delay(200);
    const records = getRecords();
    return records.find((r) => r.id === id) || null;
  },

  // Update record status (approve/reject)
  updateRecordStatus: async (
    id: string,
    status: RecordStatus,
    reviewerEmail?: string,
    reviewNotes?: string
  ): Promise<ProductRecord | null> => {
    await delay(400);

    const records = getRecords();
    const index = records.findIndex((r) => r.id === id);

    if (index === -1) return null;

    records[index] = {
      ...records[index],
      status,
      reviewNotes,
      reviewedBy: reviewerEmail || "Admin",
      updatedAt: new Date().toISOString(),
    };

    saveRecords(records);
    return records[index];
  },

  // Delete a record
  deleteRecord: async (id: string): Promise<boolean> => {
    await delay(300);

    const records = getRecords();
    const filtered = records.filter((r) => r.id !== id);

    if (filtered.length === records.length) return false;

    saveRecords(filtered);
    return true;
  },
};
