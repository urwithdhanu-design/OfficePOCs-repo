import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { SubmittedRecordsTable } from "./SubmittedRecordsTable";

interface MySubmissionsDialogProps {
  userId?: string;
  userEmail?: string;
  userRole?: "admin" | "business_manager" | "business_user";
}

export const MySubmissionsDialog = ({ userId, userEmail, userRole }: MySubmissionsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          My Submissions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-popover">
        <DialogHeader>
          <DialogTitle>My Submissions</DialogTitle>
          <DialogDescription>
            Track the status of your submitted product configurations
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <SubmittedRecordsTable
            userId={userId}
            userEmail={userEmail}
            userRole={userRole}
            showAllRecords={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};