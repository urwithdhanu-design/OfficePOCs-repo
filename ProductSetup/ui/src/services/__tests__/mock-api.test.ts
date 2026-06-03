import { mockApi } from "../mock-api";
import { ProductData, EXTERNAL_SYSTEMS } from "@/types/product";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const mockProductData: ProductData = {
  productName: "Test Gold Card",
  brands: ["lloyds"],
  additionalCardholders: 2,
  features: [
    {
      id: "cashback",
      code: "CASHBACK",
      name: "Cashback Rewards",
      description: "Earn cashback",
      category: "Rewards",
    },
  ],
  externalSystems: EXTERNAL_SYSTEMS.map((system) => ({
    system,
    id: "",
    name: "",
  })),
};

describe("mockApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe("submitProduct", () => {
    it("creates a new product record with pending status", async () => {
      const result = await mockApi.submitProduct(mockProductData, "user-123", "test@example.com");
      
      expect(result).toHaveProperty("id");
      expect(result.status).toBe("pending");
      expect(result.submittedBy).toBe("test@example.com");
      expect(result.submittedByUserId).toBe("user-123");
      expect(result.productData).toEqual(mockProductData);
    });

    it("generates unique IDs for each submission", async () => {
      const result1 = await mockApi.submitProduct(mockProductData);
      const result2 = await mockApi.submitProduct(mockProductData);
      
      expect(result1.id).not.toBe(result2.id);
    });

    it("saves record to localStorage", async () => {
      await mockApi.submitProduct(mockProductData);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("uses default submittedBy when not provided", async () => {
      const result = await mockApi.submitProduct(mockProductData);
      
      expect(result.submittedBy).toBe("User");
    });
  });

  describe("getAllRecords", () => {
    it("returns empty array when no records exist", async () => {
      const result = await mockApi.getAllRecords();
      
      expect(result).toEqual([]);
    });

    it("returns all submitted records", async () => {
      await mockApi.submitProduct(mockProductData, "user-1", "user1@test.com");
      await mockApi.submitProduct(mockProductData, "user-2", "user2@test.com");
      
      const result = await mockApi.getAllRecords();
      
      expect(result.length).toBe(2);
    });
  });

  describe("getRecordsByUser", () => {
    it("returns only records for the specified user", async () => {
      await mockApi.submitProduct(mockProductData, "user-1", "user1@test.com");
      await mockApi.submitProduct(mockProductData, "user-2", "user2@test.com");
      await mockApi.submitProduct(mockProductData, "user-1", "user1@test.com");
      
      const result = await mockApi.getRecordsByUser("user-1");
      
      expect(result.length).toBe(2);
      result.forEach((record) => {
        expect(record.submittedByUserId).toBe("user-1");
      });
    });

    it("returns empty array when user has no records", async () => {
      await mockApi.submitProduct(mockProductData, "user-1", "user1@test.com");
      
      const result = await mockApi.getRecordsByUser("user-999");
      
      expect(result).toEqual([]);
    });
  });

  describe("getRecordsByStatus", () => {
    it("returns only records with matching status", async () => {
      const record1 = await mockApi.submitProduct(mockProductData);
      await mockApi.submitProduct(mockProductData);
      
      await mockApi.updateRecordStatus(record1.id, "approved", "admin@test.com");
      
      const pendingRecords = await mockApi.getRecordsByStatus("pending");
      const approvedRecords = await mockApi.getRecordsByStatus("approved");
      
      expect(pendingRecords.length).toBe(1);
      expect(approvedRecords.length).toBe(1);
    });
  });

  describe("getRecordById", () => {
    it("returns the correct record by ID", async () => {
      const submitted = await mockApi.submitProduct(mockProductData, "user-1", "test@test.com");
      
      const result = await mockApi.getRecordById(submitted.id);
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe(submitted.id);
    });

    it("returns null for non-existent ID", async () => {
      const result = await mockApi.getRecordById("non-existent-id");
      
      expect(result).toBeNull();
    });
  });

  describe("updateRecordStatus", () => {
    it("updates record status to approved", async () => {
      const record = await mockApi.submitProduct(mockProductData);
      
      const result = await mockApi.updateRecordStatus(record.id, "approved", "admin@test.com", "Looks good");
      
      expect(result?.status).toBe("approved");
      expect(result?.reviewedBy).toBe("admin@test.com");
      expect(result?.reviewNotes).toBe("Looks good");
    });

    it("updates record status to rejected", async () => {
      const record = await mockApi.submitProduct(mockProductData);
      
      const result = await mockApi.updateRecordStatus(record.id, "rejected", "admin@test.com", "Missing info");
      
      expect(result?.status).toBe("rejected");
    });

    it("returns null for non-existent record", async () => {
      const result = await mockApi.updateRecordStatus("non-existent", "approved");
      
      expect(result).toBeNull();
    });

    it("uses default reviewer when not provided", async () => {
      const record = await mockApi.submitProduct(mockProductData);
      
      const result = await mockApi.updateRecordStatus(record.id, "approved");
      
      expect(result?.reviewedBy).toBe("Admin");
    });

    it("updates the updatedAt timestamp", async () => {
      const record = await mockApi.submitProduct(mockProductData);
      const originalUpdatedAt = record.updatedAt;
      
      // Wait a bit to ensure timestamp changes
      await new Promise((r) => setTimeout(r, 10));
      
      const result = await mockApi.updateRecordStatus(record.id, "approved");
      
      expect(result?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe("deleteRecord", () => {
    it("deletes an existing record", async () => {
      const record = await mockApi.submitProduct(mockProductData);
      
      const result = await mockApi.deleteRecord(record.id);
      
      expect(result).toBe(true);
      
      const remaining = await mockApi.getAllRecords();
      expect(remaining.length).toBe(0);
    });

    it("returns false for non-existent record", async () => {
      const result = await mockApi.deleteRecord("non-existent-id");
      
      expect(result).toBe(false);
    });

    it("does not affect other records", async () => {
      const record1 = await mockApi.submitProduct(mockProductData);
      const record2 = await mockApi.submitProduct(mockProductData);
      
      await mockApi.deleteRecord(record1.id);
      
      const remaining = await mockApi.getAllRecords();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe(record2.id);
    });
  });
});
