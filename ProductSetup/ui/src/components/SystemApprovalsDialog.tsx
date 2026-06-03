import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductRecord } from "@/types/product-record";
import { ThirdPartySystemApproval, SystemApprovalStatus } from "@/types/third-party-system";
import { mockSystemApprovalsApi } from "@/services/mock-system-approvals";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, XCircle, Search } from "lucide-react";

interface SystemApprovalsDialogProps {
  record: ProductRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

const statusConfig: Record<SystemApprovalStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> },
  in_review: { label: "In Review", color: "bg-blue-100 text-blue-800", icon: <Search className="w-4 h-4" /> },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
};

export const SystemApprovalsDialog: React.FC<SystemApprovalsDialogProps> = ({
  record,
  open,
  onOpenChange,
  readOnly = false,
}) => {
  const [systems, setSystems] = useState<ThirdPartySystemApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSystemApprovals();
    }
  }, [open, record.id]);

  const loadSystemApprovals = async () => {
    setLoading(true);
    const approvals = await mockSystemApprovalsApi.getSystemApprovals(record.id);
    setSystems(approvals);
    setLoading(false);
  };

  const handleStatusChange = async (systemId: string, newStatus: SystemApprovalStatus) => {
    const updated = await mockSystemApprovalsApi.updateSystemStatus(
      record.id,
      systemId,
      newStatus,
      "Admin"
    );
    
    if (updated) {
      setSystems((prev) =>
        prev.map((s) => (s.id === systemId ? updated : s))
      );
      toast({
        title: "Status Updated",
        description: `System status changed to ${statusConfig[newStatus].label}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Third-Party System Approvals</DialogTitle>
          <DialogDescription>
            {record.productData.productName} - {readOnly ? "View" : "Manage"} approval status for each integrated system
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {systems.map((system) => (
              <div
                key={system.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="flex-1">
                  <div className="font-medium">{system.systemName}</div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(system.lastUpdated).toLocaleString()}
                    {system.updatedBy && ` by ${system.updatedBy}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusConfig[system.status].color}>
                    <span className="mr-1">{statusConfig[system.status].icon}</span>
                    {statusConfig[system.status].label}
                  </Badge>
                  {!readOnly && (
                    <Select
                      value={system.status}
                      onValueChange={(value) => handleStatusChange(system.id, value as SystemApprovalStatus)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
