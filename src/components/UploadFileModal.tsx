import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UploadFileModal({ isOpen, onClose, oppgave, onUpload }) {
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('filer', file);
    });
    formData.append('oppgaveId', oppgave.id);

    await onUpload(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Last opp filer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            required
          />
          <Button type="submit">Last opp</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}