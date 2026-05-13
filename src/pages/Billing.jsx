import { Printer } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { apiBaseUrl, currency } from "../lib/utils";

export function Billing() {
  const { data } = useApi(() => api.bookings(""), []);
  const bookings = data ?? [];
  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-xl font-bold">Receipts & Billing</h2>
          <p className="text-sm text-slate-500">Printable booking receipts, payment receipts, and GST-ready checkout bills.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
            <div>
              <div className="font-bold">{booking.bookingCode}</div>
              <div className="text-sm text-slate-500">{booking.guest.fullName} · Room {booking.room.number}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{currency(booking.totalAmount)}</div>
              <div className="text-sm text-slate-500">Pending {currency(booking.pendingAmount)}</div>
            </div>
            <Button variant="secondary" onClick={() => window.open(`${apiBaseUrl}/api/receipts/${booking.id}`, "_blank")}><Printer size={17} /> Print</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
