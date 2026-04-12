"use client";

import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title        = "Are you sure?",
  message      = "This action cannot be undone.",
  confirmLabel = "Confirm",
  loading      = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-5">

        {/* Warning icon + message */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed pt-1.5">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}