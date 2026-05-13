import { CalendarClock, LogIn, LogOut, Sparkles, Trash2, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { currency, shortDate } from "../lib/utils";

const statusStyles = {
  AVAILABLE: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
  OCCUPIED: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200",
  CLEANING: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
  RESERVED: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-200",
  MAINTENANCE: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
};

const dotStyles = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-rose-500",
  CLEANING: "bg-amber-400",
  RESERVED: "bg-violet-500",
  MAINTENANCE: "bg-slate-400"
};

export function RoomCard({ room, onStatus, onReserve, onDetails, onDelete }) {
  const booking = room.bookings?.[0];
  const groupBooking = room.groupRooms?.[0]?.groupBooking;
  const activeName = booking?.guest?.fullName || groupBooking?.eventName || "No active guest";
  const checkIn = booking?.checkIn || groupBooking?.checkIn;
  const checkOut = booking?.checkOut || groupBooking?.checkOut;
  const guests = booking?.numberOfGuests || groupBooking?.totalGuests;
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-premium ${statusStyles[room.status]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotStyles[room.status]}`} />
            <span className="text-xs font-semibold uppercase tracking-wide">{room.status.replace("_", " ")}</span>
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight">{room.number}</div>
          <div className="text-sm font-medium">{room.type} · Floor {room.floor}</div>
        </div>
        <div className="rounded-lg bg-white/60 px-3 py-2 text-right text-sm dark:bg-black/20">
          <div className="font-bold">{currency(room.price)}</div>
          <div className="text-xs opacity-70">per night</div>
        </div>
      </div>
      <div className="mt-4 min-h-24 rounded-lg bg-white/55 p-3 text-sm dark:bg-black/20">
        <div className="font-semibold">{activeName}</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs opacity-80">
          <span>In: {shortDate(checkIn)}</span>
          <span>Out: {shortDate(checkOut)}</span>
          <span>Guests: {guests || "-"}</span>
          <span>Due: {booking ? currency(booking.pendingAmount) : "-"}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {room.status === "AVAILABLE" ? (
          <>
            <Button size="sm" onClick={() => onReserve(room)}><LogIn size={15} /> Check In</Button>
            <Button size="sm" variant="secondary" onClick={() => onReserve(room)}><CalendarClock size={15} /> Reserve</Button>
          </>
        ) : room.status === "OCCUPIED" ? (
          <>
            <Button size="sm" onClick={() => onStatus(room.id, "CLEANING")}><LogOut size={15} /> Check Out</Button>
            <Button size="sm" variant="secondary" onClick={onDetails}>Details</Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => onStatus(room.id, "AVAILABLE")}><Sparkles size={15} /> Available</Button>
            <Button size="sm" variant="secondary" onClick={onDetails}>Details</Button>
          </>
        )}
        <Button size="sm" variant="ghost" onClick={() => onStatus(room.id, "CLEANING")}><Sparkles size={15} /> Cleaning</Button>
        <Button size="sm" variant="ghost" onClick={() => onStatus(room.id, "MAINTENANCE")}><Wrench size={15} /> Maintain</Button>
        <Button size="sm" variant="ghost" className="col-span-2 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950" onClick={() => onDelete(room)}><Trash2 size={15} /> Delete Room</Button>
      </div>
    </motion.div>
  );
}
