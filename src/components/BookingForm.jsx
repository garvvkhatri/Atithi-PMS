import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "./ui/Button";
import { Input, Select, Textarea } from "./ui/Input";
import { currency } from "../lib/utils";

export function BookingForm({ rooms, selectedRoom, onSubmit, onCancel }) {
  const firstAvailable = selectedRoom?.id || rooms.find((room) => room.status === "AVAILABLE")?.id || rooms[0]?.id;
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    idProof: "Aadhaar",
    idNumber: "",
    vehicleNumber: "",
    numberOfGuests: 2,
    roomId: firstAvailable,
    checkIn: new Date().toISOString().slice(0, 10),
    checkOut: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    roomPrice: selectedRoom?.price || rooms.find((room) => room.id === firstAvailable)?.price || 1600,
    advancePayment: 0,
    status: "RESERVED",
    source: "Walk-in",
    notes: ""
  });

  const selected = rooms.find((room) => Number(room.id) === Number(form.roomId));
  const nights = useMemo(() => Math.max(1, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)), [form.checkIn, form.checkOut]);
  const total = nights * Number(form.roomPrice || selected?.price || 0);
  const pending = Math.max(0, total - Number(form.advancePayment || 0));

  function setValue(key, value) {
    const next = { ...form, [key]: value };
    if (key === "roomId") {
      const room = rooms.find((item) => Number(item.id) === Number(value));
      next.roomPrice = room?.price || next.roomPrice;
    }
    setForm(next);
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="grid grid-cols-3 gap-3">
        <Input required placeholder="Full name" value={form.fullName} onChange={(event) => setValue("fullName", event.target.value)} />
        <Input required placeholder="Phone number" value={form.phone} onChange={(event) => setValue("phone", event.target.value)} />
        <Input placeholder="Vehicle number" value={form.vehicleNumber} onChange={(event) => setValue("vehicleNumber", event.target.value)} />
        <Select value={form.idProof} onChange={(event) => setValue("idProof", event.target.value)}>
          <option>Aadhaar</option>
          <option>PAN</option>
          <option>Driving Licence</option>
          <option>Passport</option>
        </Select>
        <Input placeholder="ID number" value={form.idNumber} onChange={(event) => setValue("idNumber", event.target.value)} />
        <Input type="number" min="1" placeholder="Guests" value={form.numberOfGuests} onChange={(event) => setValue("numberOfGuests", event.target.value)} />
      </div>
      <Textarea placeholder="Address" value={form.address} onChange={(event) => setValue("address", event.target.value)} />
      <div className="grid grid-cols-4 gap-3">
        <Select value={form.roomId} onChange={(event) => setValue("roomId", event.target.value)}>
          {rooms.map((room) => <option key={room.id} value={room.id}>Room {room.number} · {room.type}</option>)}
        </Select>
        <Input type="date" value={form.checkIn} onChange={(event) => setValue("checkIn", event.target.value)} />
        <Input type="date" value={form.checkOut} onChange={(event) => setValue("checkOut", event.target.value)} />
        <Select value={form.status} onChange={(event) => setValue("status", event.target.value)}>
          <option value="RESERVED">Reserve</option>
          <option value="CHECKED_IN">Check in now</option>
        </Select>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Input type="number" value={form.roomPrice} onChange={(event) => setValue("roomPrice", event.target.value)} />
        <Input type="number" placeholder="Advance" value={form.advancePayment} onChange={(event) => setValue("advancePayment", event.target.value)} />
        <Input placeholder="Source" value={form.source} onChange={(event) => setValue("source", event.target.value)} />
        <Input placeholder="Notes" value={form.notes} onChange={(event) => setValue("notes", event.target.value)} />
      </div>
      <div className="flex items-center justify-between rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
        <div className="text-sm text-slate-500 dark:text-slate-400">{nights} night stay · Pending {currency(pending)}</div>
        <div className="text-2xl font-bold">{currency(total)}</div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Save size={17} /> Save booking</Button>
      </div>
    </form>
  );
}
