import { useState } from "react";
import { Ban, CheckCircle2, DoorOpen, Printer, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { apiBaseUrl, currency, shortDate } from "../lib/utils";

export function Bookings() {
  const [query, setQuery] = useState("");
  const { data, loading, error, refresh } = useApi(() => api.bookings(query), [query]);
  const bookings = data ?? [];

  async function action(fn, id) {
    await fn(id);
    refresh();
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-xl font-bold">Booking Management</h2>
            <p className="text-sm text-slate-500">Search, filter, check in, check out, cancel, and print receipts.</p>
          </div>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input className="pl-10" placeholder="Guest, phone, room, booking ID, event" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </CardHeader>
      </Card>
      {loading && <div className="text-slate-500">Loading bookings...</div>}
      {error && <div className="rounded-lg bg-rose-50 p-5 text-rose-700">{error}</div>}
      <div className="grid gap-3">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="grid grid-cols-[1.25fr_1fr_1fr_1fr_auto] items-center gap-5 p-5">
              <div>
                <div className="text-xs font-semibold text-slate-500">{booking.bookingCode}</div>
                <div className="text-lg font-bold">{booking.guest.fullName}</div>
                <div className="text-sm text-slate-500">{booking.guest.phone} · {booking.guest.vehicleNumber || "No vehicle"}</div>
              </div>
              <div>
                <div className="font-semibold">Room {booking.room.number}</div>
                <div className="text-sm text-slate-500">{booking.room.type}</div>
              </div>
              <div>
                <div className="font-semibold">{shortDate(booking.checkIn)} - {shortDate(booking.checkOut)}</div>
                <div className="text-sm text-slate-500">{booking.nights} nights · {booking.numberOfGuests} guests</div>
              </div>
              <div>
                <div className="font-bold">{currency(booking.totalAmount)}</div>
                <div className="text-sm text-slate-500">Due {currency(booking.pendingAmount)} · {booking.paymentStatus}</div>
              </div>
              <div className="flex gap-2">
                {booking.status === "RESERVED" && <Button size="sm" onClick={() => action(api.checkIn, booking.id)}><CheckCircle2 size={15} /> In</Button>}
                {booking.status === "CHECKED_IN" && <Button size="sm" onClick={() => action(api.checkOut, booking.id)}><DoorOpen size={15} /> Out</Button>}
                <Button size="sm" variant="secondary" onClick={() => window.open(`${apiBaseUrl}/api/receipts/${booking.id}`, "_blank")}><Printer size={15} /></Button>
                <Button size="sm" variant="ghost" onClick={() => action(api.cancelBooking, booking.id)}><Ban size={15} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
