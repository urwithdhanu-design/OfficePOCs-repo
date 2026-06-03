import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/services/mock-api";
import { ProductData } from "@/types/product";

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

describe("Product Submission Flow", () => {
  const mockProductData: ProductData = {
    productName: "Premium Rewards Card",
    brands: ["lloyds", "halifax"],
    additionalCardholders: 3,
    features: [
      {
        id: "feat-1",
        name: "Cashback",
        code: "CASH001",
        description: "Earn cashback on purchases",
        category: "Rewards",
        value: "2%",
        priority: 1,
      },
    ],
    externalSystems: [
      { system: "Core Banking", id: "CB001", name: "Core Banking System" },
    ],
  };

  it("submits a product and retrieves it", async () => {
    // Submit product
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    expect(record.id).toBeDefined();
    expect(record.status).toBe("pending");
    expect(record.productData.productName).toBe("Premium Rewards Card");
    expect(record.submittedBy).toBe("user@example.com");

    // Retrieve all records
    const allRecords = await mockApi.getAllRecords();
    expect(allRecords.length).toBeGreaterThanOrEqual(1);
    expect(allRecords.some((r) => r.id === record.id)).toBe(true);

    // Retrieve by ID
    const retrieved = await mockApi.getRecordById(record.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.productData.productName).toBe("Premium Rewards Card");
  });

  it("filters records by status", async () => {
    // Submit multiple products
    await mockApi.submitProduct(mockProductData, "user-1", "user1@example.com");
    const record2 = await mockApi.submitProduct(
      { ...mockProductData, productName: "Basic Card" },
      "user-2",
      "user2@example.com"
    );

    // Approve one
    await mockApi.updateRecordStatus(record2.id, "approved", "manager@example.com");

    // Filter by pending
    const pending = await mockApi.getRecordsByStatus("pending");
    expect(pending.every((r) => r.status === "pending")).toBe(true);

    // Filter by approved
    const approved = await mockApi.getRecordsByStatus("approved");
    expect(approved.every((r) => r.status === "approved")).toBe(true);
    expect(approved.some((r) => r.id === record2.id)).toBe(true);
  });

  it("updates record status with review notes", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    expect(record.status).toBe("pending");

    // Approve with notes
    const updated = await mockApi.updateRecordStatus(
      record.id,
      "approved",
      "manager@lloyds.com",
      "Looks good, approved for production"
    );

    expect(updated?.status).toBe("approved");
    expect(updated?.reviewedBy).toBe("manager@lloyds.com");
    expect(updated?.reviewNotes).toBe("Looks good, approved for production");
  });

  it("rejects a submission with notes", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    const rejected = await mockApi.updateRecordStatus(
      record.id,
      "rejected",
      "manager@lloyds.com",
      "Missing required features"
    );

    expect(rejected?.status).toBe("rejected");
    expect(rejected?.reviewNotes).toBe("Missing required features");
  });

  it("deletes a record", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    const deleted = await mockApi.deleteRecord(record.id);
    expect(deleted).toBe(true);

    const retrieved = await mockApi.getRecordById(record.id);
    expect(retrieved).toBeNull();
  });

  it("returns false when deleting non-existent record", async () => {
    const deleted = await mockApi.deleteRecord("non-existent-id");
    expect(deleted).toBe(false);
  });

  it("returns null when updating non-existent record", async () => {
    const updated = await mockApi.updateRecordStatus(
      "non-existent-id",
      "approved"
    );
    expect(updated).toBeNull();
  });

  it("filters records by user", async () => {
    await mockApi.submitProduct(mockProductData, "user-1", "user1@example.com");
    await mockApi.submitProduct(
      { ...mockProductData, productName: "User 2 Card" },
      "user-2",
      "user2@example.com"
    );

    const user1Records = await mockApi.getRecordsByUser("user-1");
    expect(user1Records.every((r) => r.submittedByUserId === "user-1")).toBe(true);
  });
});

describe("Complete Approval Workflow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("simulates full workflow: submit → review → approve → verify", async () => {
    const productData: ProductData = {
      productName: "Platinum Card",
      brands: ["lloyds"],
      additionalCardholders: 2,
      features: [],
      externalSystems: [],
    };

    // Step 1: Business User submits
    const submission = await mockApi.submitProduct(
      productData,
      "business-user-1",
      "user@lloyds.com"
    );
    expect(submission.status).toBe("pending");

    // Step 2: Manager reviews and sees pending
    const pendingRecords = await mockApi.getRecordsByStatus("pending");
    expect(pendingRecords.some((r) => r.id === submission.id)).toBe(true);

    // Step 3: Manager approves
    const approved = await mockApi.updateRecordStatus(
      submission.id,
      "approved",
      "manager@lloyds.com",
      "Approved for launch"
    );
    expect(approved?.status).toBe("approved");

    // Step 4: Verify it appears in approved list
    const approvedRecords = await mockApi.getRecordsByStatus("approved");
    expect(approvedRecords.some((r) => r.id === submission.id)).toBe(true);

    // Step 5: Verify it's no longer pending
    const stillPending = await mockApi.getRecordsByStatus("pending");
    expect(stillPending.some((r) => r.id === submission.id)).toBe(false);
  });

  it("simulates rejection workflow", async () => {
    const productData: ProductData = {
      productName: "Incomplete Card",
      brands: [],
      additionalCardholders: 0,
      features: [],
      externalSystems: [],
    };

    // Submit
    const submission = await mockApi.submitProduct(
      productData,
      "business-user-1",
      "user@lloyds.com"
    );

    // Reject
    const rejected = await mockApi.updateRecordStatus(
      submission.id,
      "rejected",
      "manager@lloyds.com",
      "No brands selected, please add at least one brand"
    );

    expect(rejected?.status).toBe("rejected");
    expect(rejected?.reviewNotes).toContain("No brands selected");

    // Verify in rejected list
    const rejectedRecords = await mockApi.getRecordsByStatus("rejected");
    expect(rejectedRecords.some((r) => r.id === submission.id)).toBe(true);
  });
});
