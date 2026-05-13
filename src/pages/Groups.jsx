import { useState } from "react";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { shortDate } from "../lib/utils";

export function Groups() {
  const { data: groupData, refresh } = useApi(api.groups, []);
  const { data: roomData } = useApi(api.rooms, []);
  const groups = groupData ?? [];
  const rooms = roomData ?? [];
  const [form, setForm] = useState({
    eventName: "",
    eventType: "WEDDING",
    groupLeader: "",
    phone: "",
    totalGuests: 20,
    checkIn: new Date().toISOString().slice(0, 10),
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    roomIds: [],
    cateringNotes: "",
    decorationNotes: ""
  });
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      await api.createGroup(form);
      setMessage("Function booking saved with linked room reservations.");
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-5">
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <h2 className="text-xl font-bold">Group / Function Booking</h2>
            <p className="text-sm text-slate-500">Reserve multiple rooms for weddings, family events, birthdays, and group stays.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-3 gap-3">
              <Input required placeholder="Event name" value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} />
              <Select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                <option value="WEDDING">Wedding</option>
                <option value="BIRTHDAY">Birthday</option>
                <option value="FAMILY_EVENT">Family event</option>
                <option value="CORPORATE">Corporate</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input type="number" placeholder="Total guests" value={form.totalGuests} onChange={(e) => setForm({ ...form, totalGuests: e.target.value })} />
              <Input required placeholder="Group leader" value={form.groupLeader} onChange={(e) => setForm({ ...form, groupLeader: e.target.value })} />
              <Input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
              <Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {rooms.map((room) => (
                <button
                  type="button"
                  key={room.id}
                  onClick={() => {
                    const exists = form.roomIds.includes(room.id);
                    setForm({ ...form, roomIds: exists ? form.roomIds.filter((id) => id !== room.id) : [...form.roomIds, room.id] });
                  }}
                  className={`rounded-lg border p-3 text-left text-sm transition ${form.roomIds.includes(room.id) ? "border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"}`}
                >
                  <div className="font-bold">{room.number}</div>
                  <div className="text-xs opacity-70">{room.type}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Textarea placeholder="Catering notes" value={form.cateringNotes} onChange={(e) => setForm({ ...form, cateringNotes: e.target.value })} />
              <Textarea placeholder="Decoration notes" value={form.decorationNotes} onChange={(e) => setForm({ ...form, decorationNotes: e.target.value })} />
            </div>
            {message && <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-100">{message}</div>}
            <Button><Save size={17} /> Save group booking</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardContent className="p-4">
              <div className="font-bold">{group.eventName}</div>
              <div className="text-sm text-slate-500">{group.eventType.replace("_", " ")} · {group.totalGuests} guests</div>
              <div className="mt-2 text-sm">{shortDate(group.checkIn)} - {shortDate(group.checkOut)}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.rooms.map(({ room }) => <span key={room.id} className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-900">Room {room.number}</span>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
