import type { OrderRecord } from "@/lib/payments/types";

export function buildOrderDescription(order: OrderRecord, fallback: string) {
  try {
    const items = JSON.parse(order.serviceSnapshot) as Array<{
      serviceLabel?: string;
      qty?: number;
      unit?: string;
    }>;
    const itemDescription = items
      .map((item) => {
        const qty = item.qty && item.qty > 1 ? `${item.qty}x ` : "";
        const unit = item.unit ? ` (${item.unit})` : "";
        return `${qty}${item.serviceLabel ?? "Servico FIRMANT"}${unit}`;
      })
      .join(" + ");

    return itemDescription
      ? `${fallback}: ${itemDescription}`.slice(0, 500)
      : fallback;
  } catch {
    return fallback;
  }
}
