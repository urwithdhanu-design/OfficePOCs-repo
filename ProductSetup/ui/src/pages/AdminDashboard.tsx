import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductRecord, RecordStatus } from "@/types/product-record";
import { BRANDS } from "@/types/product";
import { mockApi } from "@/services/mock-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { DemoRoleSwitcher } from "@/components/DemoRoleSwitcher";

export default function AdminDashboard() {
  const [records, setRecords] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ProductRecord | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getAllRecords();
      setRecords(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch records", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleStatusUpdate = async (status: RecordStatus) => {
    if (!selectedRecord) return;
    setActionLoading(true);
    try {
      await mockApi.updateRecordStatus(selectedRecord.id, status, reviewNotes);
      toast({
        title: status === "approved" ? "Approved" : "Rejected",
        description: `Product "${selectedRecord.productData.productName}" has been ${status}.`,
      });
      setReviewDialogOpen(false);
      setReviewNotes("");
      fetchRecords();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (record: ProductRecord) => {
    if (!confirm(`Are you sure you want to delete "${record.productData.productName}"?`)) return;
    try {
      await mockApi.deleteRecord(record.id);
      toast({ title: "Deleted", description: "Record has been deleted." });
      fetchRecords();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete record", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: RecordStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
  };

  const getBrandLabels = (brands: string[]) => brands.map((brand) => BRANDS.find((b) => b.value === brand)?.label || brand).join(", ") || "None";

  const filterRecords = (status?: RecordStatus) =>
    status ? records.filter((r) => r.status === status) : records;

  const RecordTable = ({ data }: { data: ProductRecord[] }) => (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Brand</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Features</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Submitted</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No records found
              </td>
            </tr>
          ) : (
            data.map((record) => (
              <tr key={record.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium text-foreground">{record.productData.productName}</td>
                <td className="px-4 py-3 text-muted-foreground">{getBrandLabels(record.productData.brands)}</td>
                <td className="px-4 py-3 text-muted-foreground">{record.productData.features.length}</td>
                <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                <td className="px-4 py-3 text-muted-foreground text-sm">
                  {new Date(record.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {record.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setReviewDialogOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(record)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <DemoRoleSwitcher />
            <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{filterRecords("pending").length}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{filterRecords("approved").length}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{filterRecords("rejected").length}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({records.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterRecords("pending").length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({filterRecords("approved").length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filterRecords("rejected").length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <RecordTable data={records} />
          </TabsContent>
          <TabsContent value="pending">
            <RecordTable data={filterRecords("pending")} />
          </TabsContent>
          <TabsContent value="approved">
            <RecordTable data={filterRecords("approved")} />
          </TabsContent>
          <TabsContent value="rejected">
            <RecordTable data={filterRecords("rejected")} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Product Configuration</DialogTitle>
            <DialogDescription>
              Review "{selectedRecord?.productData.productName}" and approve or reject it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Review Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about your decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("rejected")}
              disabled={actionLoading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleStatusUpdate("approved")}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.productData.productName}</DialogTitle>
            <DialogDescription>
              Product configuration details
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Brand(s)</div>
                  <div className="font-medium">{getBrandLabels(selectedRecord.productData.brands)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div>{getStatusBadge(selectedRecord.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Additional Cardholders</div>
                  <div className="font-medium">{selectedRecord.productData.additionalCardholders}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Submitted</div>
                  <div className="font-medium">{new Date(selectedRecord.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {selectedRecord.reviewNotes && (
                <div>
                  <div className="text-sm text-muted-foreground">Review Notes</div>
                  <div className="p-2 bg-muted rounded mt-1">{selectedRecord.reviewNotes}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-2">Features ({selectedRecord.productData.features.length})</div>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.productData.features.map((f) => (
                    <Badge key={f.id} variant="outline">{f.name}</Badge>
                  ))}
                </div>
              </div>

              {selectedRecord.productData.externalSystems.some((s) => s.id) && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">External Systems</div>
                  <div className="space-y-1">
                    {selectedRecord.productData.externalSystems
                      .filter((s) => s.id)
                      .map((s) => (
                        <div key={s.system} className="text-sm">
                          <span className="font-medium">{s.system}:</span> {s.id}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
