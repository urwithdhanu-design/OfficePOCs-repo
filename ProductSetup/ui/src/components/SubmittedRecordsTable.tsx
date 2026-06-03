import React, { useState, useEffect } from "react";
import { ProductRecord, RecordStatus } from "@/types/product-record";
import { BRANDS } from "@/types/product";
import { mockApi } from "@/services/mock-api";
import { mockAuthService } from "@/services/mock-auth-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Eye, Check, X, Clock, CheckCircle, XCircle, Loader2, Settings2 } from "lucide-react";
import { SystemApprovalsDialog } from "./SystemApprovalsDialog";
import { ApprovalWorkflowCopilot } from "@/components/ai/ApprovalWorkflowCopilot";
import type { ProductData } from "@/types/product";

interface SubmittedRecordsTableProps {
  userId?: string;
  userEmail?: string;
  userRole?: "admin" | "business_manager" | "business_user";
  showAllRecords?: boolean;
  onRecordUpdated?: () => void;
}

export const SubmittedRecordsTable: React.FC<SubmittedRecordsTableProps> = ({
  userId,
  userEmail,
  userRole = "business_user",
  showAllRecords = false,
  onRecordUpdated,
}) => {
  const { toast } = useToast();
  const [records, setRecords] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ProductRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [systemApprovalsRecord, setSystemApprovalsRecord] = useState<ProductRecord | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const canApprove = userRole === "admin" || userRole === "business_manager";

  useEffect(() => {
    loadRecords();
  }, [userId, showAllRecords]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      // Always load all records - in a real app, this would be filtered server-side
      // For demo purposes, we show all records since userId changes on each login
      const data = await mockApi.getAllRecords();
      setRecords(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error loading records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: ProductRecord) => {
    setSelectedRecord(record);
    setReviewNotes(record.reviewNotes || "");
    setDetailOpen(true);
  };

  const findPreviousProductData = (record: ProductRecord): ProductData | undefined => {
    const sameName = records
      .filter(
        (r) =>
          r.id !== record.id &&
          r.productData.productName.toLowerCase() === record.productData.productName.toLowerCase() &&
          new Date(r.createdAt) < new Date(record.createdAt),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sameName[0]?.productData;
  };

  const handleApprove = async () => {
    if (!selectedRecord) return;
    setApproving(true);
    try {
      await mockApi.updateRecordStatus(selectedRecord.id, "approved", userEmail, reviewNotes);
      // Log the approval activity
      if (userId && userEmail) {
        await mockAuthService.logActivity(
          userId,
          userEmail,
          "approve_product",
          `Approved product "${selectedRecord.productData.productName}"`
        );
      }
      toast({ title: "Approved", description: "Product configuration has been approved." });
      setDetailOpen(false);
      loadRecords();
      onRecordUpdated?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve record.", variant: "destructive" });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRecord) return;
    setRejecting(true);
    try {
      await mockApi.updateRecordStatus(selectedRecord.id, "rejected", userEmail, reviewNotes);
      // Log the rejection activity
      if (userId && userEmail) {
        await mockAuthService.logActivity(
          userId,
          userEmail,
          "reject_product",
          `Rejected product "${selectedRecord.productData.productName}"`
        );
      }
      toast({ title: "Rejected", description: "Product configuration has been rejected." });
      setDetailOpen(false);
      loadRecords();
      onRecordUpdated?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject record.", variant: "destructive" });
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status: RecordStatus) => {
    const config = {
      pending: { variant: "outline" as const, icon: Clock, label: "Pending Review", className: "text-amber-600 border-amber-300" },
      approved: { variant: "default" as const, icon: CheckCircle, label: "Approved", className: "bg-green-600" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected", className: "" },
    };
    const { variant, icon: Icon, label, className } = config[status];
    return (
      <Badge variant={variant} className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No submitted records found.
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {records.map((record) => {
          const brandLabels = record.productData.brands
            .map((b) => BRANDS.find((br) => br.value === b)?.label || b)
            .join(", ");
          return (
            <Card key={record.id} className="cursor-pointer" onClick={() => handleViewDetails(record)}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm">{record.productData.productName}</div>
                  {getStatusBadge(record.status)}
                </div>
                <div className="text-xs text-muted-foreground">{brandLabels}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{record.productData.features.length} features</span>
                  <span>{format(new Date(record.createdAt), "MMM d, yyyy")}</span>
                </div>
                {showAllRecords && (
                  <div className="text-xs text-muted-foreground">By: {record.submittedBy}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Product Name</TableHead>
              <TableHead className="min-w-[120px]">Brands</TableHead>
              <TableHead>Features</TableHead>
              <TableHead className="min-w-[130px]">Status</TableHead>
              <TableHead className="min-w-[140px]">Submitted</TableHead>
              {showAllRecords && <TableHead className="min-w-[150px]">Submitted By</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const brandLabels = record.productData.brands
                .map((b) => BRANDS.find((br) => br.value === b)?.label || b)
                .join(", ");
              return (
                <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(record)}>
                  <TableCell className="font-medium">{record.productData.productName}</TableCell>
                  <TableCell>{brandLabels}</TableCell>
                  <TableCell>{record.productData.features.length}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>{format(new Date(record.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                  {showAllRecords && <TableCell>{record.submittedBy}</TableCell>}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(record); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.productData.productName}</DialogTitle>
            <DialogDescription>
              Submitted on {selectedRecord && format(new Date(selectedRecord.createdAt), "MMMM d, yyyy 'at' HH:mm")}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(selectedRecord.status)}
                {selectedRecord.reviewedBy && (
                  <span className="text-sm text-muted-foreground">
                    by {selectedRecord.reviewedBy}
                  </span>
                )}
              </div>

              {/* Product Summary */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Product Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Brands</span>
                      <p className="font-medium text-sm sm:text-base">
                        {selectedRecord.productData.brands
                          .map((b) => BRANDS.find((br) => br.value === b)?.label || b)
                          .join(", ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Additional Cardholders</span>
                      <p className="font-medium text-sm sm:text-base">{selectedRecord.productData.additionalCardholders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              {selectedRecord.productData.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Features ({selectedRecord.productData.features.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedRecord.productData.features.map((feature) => (
                        <div key={feature.id} className="border rounded-lg p-3 bg-muted/30">
                          <div className="font-medium text-sm">{feature.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{feature.code}</div>
                          {feature.value && (
                            <div className="text-xs mt-1">Value: {feature.value}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* External Systems */}
              {selectedRecord.productData.externalSystems.some((s) => s.id) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">External System Mappings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedRecord.productData.externalSystems
                        .filter((s) => s.id)
                        .map((system) => (
                          <div key={system.system} className="border rounded-lg p-3 bg-muted/30">
                            <div className="font-medium text-sm">{system.system}</div>
                            <div className="text-xs text-muted-foreground">ID: {system.id}</div>
                            {system.name && <div className="text-xs text-muted-foreground">Name: {system.name}</div>}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review Notes */}
              {selectedRecord.reviewNotes && selectedRecord.status !== "pending" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Review Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedRecord.reviewNotes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Approval Co-Pilot for managers reviewing pending submissions */}
              {canApprove && selectedRecord.status === "pending" && (
                <ApprovalWorkflowCopilot
                  productData={selectedRecord.productData}
                  previousProductData={findPreviousProductData(selectedRecord)}
                  submittedBy={selectedRecord.submittedBy}
                  onUseRationale={(text) => setReviewNotes(text)}
                />
              )}

              {/* Approve/Reject Actions for managers */}
              {canApprove && selectedRecord.status === "pending" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Review Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add review notes (optional)"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <Button onClick={handleApprove} disabled={approving || rejecting} className="flex-1 bg-green-600 hover:bg-green-700">
                        {approving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        Approve
                      </Button>
                      <Button onClick={handleReject} disabled={approving || rejecting} variant="destructive" className="flex-1">
                        {rejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* View System Approvals for approved records */}
              {selectedRecord.status === "approved" && (
                <Card>
                  <CardContent className="p-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setDetailOpen(false);
                        setSystemApprovalsRecord(selectedRecord);
                      }}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      View Third-Party System Approvals
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* System Approvals Dialog - Read Only for Business Manager/User */}
      {systemApprovalsRecord && (
        <SystemApprovalsDialog
          record={systemApprovalsRecord}
          open={!!systemApprovalsRecord}
          onOpenChange={(open) => !open && setSystemApprovalsRecord(null)}
          readOnly={true}
        />
      )}
    </>
  );
};
