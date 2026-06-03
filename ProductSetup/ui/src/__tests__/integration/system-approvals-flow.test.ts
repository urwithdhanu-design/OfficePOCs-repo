import { mockSystemApprovalsApi } from "@/services/mock-system-approvals";
import { mockApi } from "@/services/mock-api";
import { ProductData } from "@/types/product";
import { THIRD_PARTY_SYSTEMS } from "@/types/third-party-system";

beforeEach(() => {
  localStorage.clear();
});

describe("System Approvals Flow", () => {
  const mockProductData: ProductData = {
    productName: "Enterprise Card",
    brands: ["lloyds"],
    additionalCardholders: 5,
    features: [],
    externalSystems: [],
  };

  it("creates system approvals for a new product", async () => {
    // Create and approve a product first
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );
    await mockApi.updateRecordStatus(record.id, "approved");

    // Get system approvals
    const approvals = await mockSystemApprovalsApi.getSystemApprovals(record.id);

    expect(approvals.length).toBe(10);
    expect(approvals.every((a) => a.status === "pending")).toBe(true);
    expect(approvals.map((a) => a.systemName)).toEqual(
      expect.arrayContaining(THIRD_PARTY_SYSTEMS)
    );
  });

  it("returns existing approvals on subsequent calls", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    // First call creates
    const first = await mockSystemApprovalsApi.getSystemApprovals(record.id);
    
    // Update one status
    await mockSystemApprovalsApi.updateSystemStatus(
      record.id,
      first[0].id,
      "approved",
      "Admin"
    );

    // Second call returns existing (with updated status)
    const second = await mockSystemApprovalsApi.getSystemApprovals(record.id);
    expect(second[0].status).toBe("approved");
  });

  it("updates system status to approved", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    const approvals = await mockSystemApprovalsApi.getSystemApprovals(record.id);
    const systemId = approvals[0].id;

    const updated = await mockSystemApprovalsApi.updateSystemStatus(
      record.id,
      systemId,
      "approved",
      "admin@lloyds.com",
      "Integration verified"
    );

    expect(updated?.status).toBe("approved");
    expect(updated?.updatedBy).toBe("admin@lloyds.com");
    expect(updated?.notes).toBe("Integration verified");
  });

  it("updates system status to rejected", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    const approvals = await mockSystemApprovalsApi.getSystemApprovals(record.id);
    const systemId = approvals[1].id;

    const updated = await mockSystemApprovalsApi.updateSystemStatus(
      record.id,
      systemId,
      "rejected",
      "admin@lloyds.com",
      "Failed security audit"
    );

    expect(updated?.status).toBe("rejected");
    expect(updated?.notes).toBe("Failed security audit");
  });

  it("updates system status to in_review", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    const approvals = await mockSystemApprovalsApi.getSystemApprovals(record.id);
    const systemId = approvals[2].id;

    const updated = await mockSystemApprovalsApi.updateSystemStatus(
      record.id,
      systemId,
      "in_review",
      "admin@lloyds.com"
    );

    expect(updated?.status).toBe("in_review");
  });

  it("returns null when updating non-existent product", async () => {
    const result = await mockSystemApprovalsApi.updateSystemStatus(
      "non-existent",
      "sys-123",
      "approved"
    );

    expect(result).toBeNull();
  });

  it("returns null when updating non-existent system", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    await mockSystemApprovalsApi.getSystemApprovals(record.id);

    const result = await mockSystemApprovalsApi.updateSystemStatus(
      record.id,
      "non-existent-system",
      "approved"
    );

    expect(result).toBeNull();
  });

  it("tracks lastUpdated timestamp on status change", async () => {
    const record = await mockApi.submitProduct(
      mockProductData,
      "user-123",
      "user@example.com"
    );

    const approvals = await mockSystemApprovalsApi.getSystemApprovals(record.id);
    const original = approvals[0];
    const originalTime = new Date(original.lastUpdated).getTime();

    // Wait a bit to ensure timestamp difference
    await new Promise((r) => setTimeout(r, 10));

    const updated = await mockSystemApprovalsApi.updateSystemStatus(
      record.id,
      original.id,
      "approved",
      "Admin"
    );

    const updatedTime = new Date(updated!.lastUpdated).getTime();
    expect(updatedTime).toBeGreaterThanOrEqual(originalTime);
  });
});

describe("Complete Admin Workflow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("simulates full admin workflow: view approved → manage all systems → verify", async () => {
    const productData: ProductData = {
      productName: "Gold Card",
      brands: ["lloyds", "halifax"],
      additionalCardholders: 3,
      features: [],
      externalSystems: [],
    };

    // Step 1: Submit and approve a product
    const submission = await mockApi.submitProduct(
      productData,
      "user-1",
      "user@lloyds.com"
    );
    await mockApi.updateRecordStatus(submission.id, "approved", "manager@lloyds.com");

    // Step 2: Admin gets system approvals
    const systems = await mockSystemApprovalsApi.getSystemApprovals(submission.id);
    expect(systems.length).toBe(10);

    // Step 3: Admin approves some systems
    await mockSystemApprovalsApi.updateSystemStatus(
      submission.id,
      systems[0].id,
      "approved",
      "Admin"
    );
    await mockSystemApprovalsApi.updateSystemStatus(
      submission.id,
      systems[1].id,
      "approved",
      "Admin"
    );
    await mockSystemApprovalsApi.updateSystemStatus(
      submission.id,
      systems[2].id,
      "in_review",
      "Admin"
    );

    // Step 4: Verify statuses
    const updatedSystems = await mockSystemApprovalsApi.getSystemApprovals(submission.id);
    
    const approved = updatedSystems.filter((s) => s.status === "approved");
    const inReview = updatedSystems.filter((s) => s.status === "in_review");
    const pending = updatedSystems.filter((s) => s.status === "pending");

    expect(approved.length).toBe(2);
    expect(inReview.length).toBe(1);
    expect(pending.length).toBe(7);
  });

  it("handles multiple products with separate system approvals", async () => {
    // Create two products
    const product1 = await mockApi.submitProduct(
      { productName: "Product 1", brands: ["lloyds"], additionalCardholders: 0, features: [], externalSystems: [] },
      "user-1",
      "user@lloyds.com"
    );
    const product2 = await mockApi.submitProduct(
      { productName: "Product 2", brands: ["halifax"], additionalCardholders: 0, features: [], externalSystems: [] },
      "user-2",
      "user2@lloyds.com"
    );

    // Get approvals for both
    const systems1 = await mockSystemApprovalsApi.getSystemApprovals(product1.id);
    const systems2 = await mockSystemApprovalsApi.getSystemApprovals(product2.id);

    // Update one system in product1
    await mockSystemApprovalsApi.updateSystemStatus(
      product1.id,
      systems1[0].id,
      "approved",
      "Admin"
    );

    // Verify product2 systems are unaffected
    const updated2 = await mockSystemApprovalsApi.getSystemApprovals(product2.id);
    expect(updated2.every((s) => s.status === "pending")).toBe(true);

    // Verify product1 has the update
    const updated1 = await mockSystemApprovalsApi.getSystemApprovals(product1.id);
    expect(updated1[0].status).toBe("approved");
  });
});
