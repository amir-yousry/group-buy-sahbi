import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "sent" | "delivered" | "read";

/**
 * WhatsApp-style ticks:
 * - sent: single grey check
 * - delivered: double grey check
 * - read: double blue check
 */
export function MessageTicks({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  if (status === "sent") {
    return <Check className={cn("w-3.5 h-3.5 text-muted-foreground", className)} />;
  }
  if (status === "delivered") {
    return (
      <CheckCheck className={cn("w-3.5 h-3.5 text-muted-foreground", className)} />
    );
  }
  return <CheckCheck className={cn("w-3.5 h-3.5 text-sky-500", className)} />;
}

/**
 * Compute message status given recipient ids and the message receipts.
 * For groups: status is "read" only when ALL recipients have read,
 * "delivered" when all delivered but not all read, otherwise "sent".
 */
export function computeStatus(
  recipientIds: string[],
  deliveredTo: string[] = [],
  readBy: string[] = []
): Status {
  if (recipientIds.length === 0) return "sent";
  const allRead = recipientIds.every((id) => readBy.includes(id));
  if (allRead) return "read";
  const allDelivered = recipientIds.every((id) => deliveredTo.includes(id));
  if (allDelivered) return "delivered";
  return "sent";
}
