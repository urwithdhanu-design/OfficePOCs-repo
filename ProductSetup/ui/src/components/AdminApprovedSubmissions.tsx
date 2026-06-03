import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/services/mock-api";
import { ProductRecord } from "@/types/product-record";
import { CheckCircle, ChevronRight } from "lucide-react";
import { SystemApprovalsDialog } from "./SystemApprovalsDialog";

export const AdminApprovedSubmissions: React.FC = () => {
  const [approvedRecords, setApprovedRecords] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ProductRecord | null>(null);

  useEffect(() => {
    loadApprovedRecords();
  }, []);

  const loadApprovedRecords = async () => {
    setLoading(true);
    const records = await mockApi.getRecordsByStatus("approved");
    setApprovedRecords(records);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (approvedRecords.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No approved submissions yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {approvedRecords.map((record) => (
          <Card
            key={record.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setSelectedRecord(record)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{record.productData.productName}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Brands: {record.productData.brands.join(", ")}</span>
                    <span className="mx-2">•</span>
                    <span>Features: {record.productData.features.length}</span>
                    <span className="mx-2">•</span>
                    <span>Submitted by: {record.submittedBy}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Approved on: {new Date(record.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRecord && (
        <SystemApprovalsDialog
          record={selectedRecord}
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
        />
      )}
    </>
  );
};
