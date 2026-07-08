import { toast } from "sonner";
import { X } from "lucide-react";

export function flashMessage_Success(msg: string) {
  toast.success(msg, {
    style: {
      backgroundColor: "#16a34a", // green-600
      color: "white",
      border: "none",
    },
   cancel: {
      label: "✕",   // ✅ string only
      onClick: () => toast.dismiss(),
    },
  });
}

export function flashMessage_Failed(msg: string) {
  toast.error(msg, {
    style: {
      backgroundColor: "#dc2626", // red-600
      color: "white",
      border: "none",
    },
    action: {
      label: "✕",
      onClick: () => toast.dismiss(),
    },
  });
}