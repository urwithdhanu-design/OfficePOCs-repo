import { useState, useEffect } from "react";
import { AuditEntry, ProductVersion } from "@/types/audit";
import { ActivityLog } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, Download, Clock, FileText, Activity } from "lucide-react";
import { format } from "date-fns";

interface AuditTrailProps {
  auditTrail: AuditEntry[];
  versions: ProductVersion[];
  activityLogs?: ActivityLog[];
  onExportAudit: () => void;
  onRestoreVersion: (version: number) => void;
}

const ACTION_COLORS: Record<AuditEntry["action"], string> = {
  created: "bg-success/10 text-success border-success/20",
  updated: "bg-primary/10 text-primary border-primary/20",
  feature_added: "bg-accent/10 text-accent border-accent/20",
  feature_removed: "bg-destructive/10 text-destructive border-destructive/20",
  feature_updated: "bg-primary/10 text-primary border-primary/20",
  system_updated: "bg-muted text-muted-foreground border-border",
};

const ACTION_LABELS: Record<AuditEntry["action"], string> = {
  created: "Created",
  updated: "Updated",
  feature_added: "Feature Added",
  feature_removed: "Feature Removed",
  feature_updated: "Feature Updated",
  system_updated: "System Updated",
};

const ACTIVITY_COLORS: Record<string, string> = {
  login: "bg-success/10 text-success border-success/20",
  logout: "bg-muted text-muted-foreground border-border",
  submit_product: "bg-primary/10 text-primary border-primary/20",
  approve_product: "bg-success/10 text-success border-success/20",
  reject_product: "bg-destructive/10 text-destructive border-destructive/20",
  create_user: "bg-accent/10 text-accent border-accent/20",
  default: "bg-muted text-muted-foreground border-border",
};

export const AuditTrail = ({ auditTrail, versions, activityLogs = [], onExportAudit, onRestoreVersion }: AuditTrailProps) => {
  const [selectedVersion, setSelectedVersion] = useState<ProductVersion | null>(null);

  const getActivityColor = (action: string) => {
    return ACTIVITY_COLORS[action] || ACTIVITY_COLORS.default;
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-2 h-4 w-4" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-popover">
        <DialogHeader>
          <DialogTitle>Product Configuration History</DialogTitle>
          <DialogDescription>
            Track all changes, user activity, and restore previous versions
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity Logs ({activityLogs.length})
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="mr-2 h-4 w-4" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="versions">
              <Clock className="mr-2 h-4 w-4" />
              Versions ({versions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {activityLogs.length} user activities recorded
              </p>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {activityLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activity logs yet
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map((log, index) => (
                    <div
                      key={log.id || index}
                      className="border-l-2 border-primary pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className={getActivityColor(log.action)}>
                              {formatAction(log.action)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.timestamp), "PPp")}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{log.userEmail}</p>
                          {log.details && (
                            <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                          )}
                          {log.page && (
                            <p className="text-xs text-muted-foreground">Page: {log.page}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {auditTrail.length} entries recorded
              </p>
              <Button size="sm" variant="outline" onClick={onExportAudit}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {auditTrail.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No audit entries yet
                </div>
              ) : (
                <div className="space-y-4">
                  {auditTrail.map((entry) => (
                    <div
                      key={entry.id}
                      className="border-l-2 border-primary pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={ACTION_COLORS[entry.action]}>
                              {ACTION_LABELS[entry.action]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(entry.timestamp), "PPp")}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{entry.description}</p>
                          {entry.field && (
                            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                              <div>Field: {entry.field}</div>
                              {entry.oldValue && <div>Previous: {entry.oldValue}</div>}
                              {entry.newValue && <div>New: {entry.newValue}</div>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="versions" className="mt-4">
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No saved versions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {[...versions].reverse().map((version) => (
                    <div
                      key={version.version}
                      className="border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Version {version.version}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(version.timestamp), "PPp")}
                            </span>
                          </div>
                          <p className="text-sm">{version.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              confirm(
                                `Restore version ${version.version}? This will replace your current configuration.`
                              )
                            ) {
                              onRestoreVersion(version.version);
                            }
                          }}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
