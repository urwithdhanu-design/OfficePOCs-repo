import { ProductSystemApprovals, ThirdPartySystemApproval, SystemApprovalStatus, THIRD_PARTY_SYSTEMS } from "@/types/third-party-system";

const STORAGE_KEY = "system_approvals";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getApprovals = (): ProductSystemApprovals[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveApprovals = (approvals: ProductSystemApprovals[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(approvals));
};

const generateSystemApprovals = (productRecordId: string): ThirdPartySystemApproval[] => {
  return THIRD_PARTY_SYSTEMS.map((systemName, index) => ({
    id: `sys_${productRecordId}_${index}`,
    systemName,
    status: "pending" as SystemApprovalStatus,
    lastUpdated: new Date().toISOString(),
  }));
};

export const mockSystemApprovalsApi = {
  getSystemApprovals: async (productRecordId: string): Promise<ThirdPartySystemApproval[]> => {
    await delay(300);
    const approvals = getApprovals();
    const existing = approvals.find((a) => a.productRecordId === productRecordId);
    
    if (existing) {
      return existing.systems;
    }
    
    // Create new approvals for this product
    const newSystems = generateSystemApprovals(productRecordId);
    approvals.push({ productRecordId, systems: newSystems });
    saveApprovals(approvals);
    return newSystems;
  },

  updateSystemStatus: async (
    productRecordId: string,
    systemId: string,
    status: SystemApprovalStatus,
    updatedBy?: string,
    notes?: string
  ): Promise<ThirdPartySystemApproval | null> => {
    await delay(200);
    const approvals = getApprovals();
    const productApprovals = approvals.find((a) => a.productRecordId === productRecordId);
    
    if (!productApprovals) return null;
    
    const systemIndex = productApprovals.systems.findIndex((s) => s.id === systemId);
    if (systemIndex === -1) return null;
    
    productApprovals.systems[systemIndex] = {
      ...productApprovals.systems[systemIndex],
      status,
      lastUpdated: new Date().toISOString(),
      updatedBy,
      notes,
    };
    
    saveApprovals(approvals);
    return productApprovals.systems[systemIndex];
  },
};
