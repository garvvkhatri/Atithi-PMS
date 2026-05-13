import { useMemo, useState } from "react";
import { BedDouble, Plus, RefreshCw, Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { RoomCard } from "../components/RoomCard";
import { BookingForm } from "../components/BookingForm";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { Input, Select, Textarea } from "../components/ui/Input";

export function Rooms() {
  const { data, loading, error, refresh } = useApi(api.rooms, []);
  const rooms = data ?? [];
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomForm, setRoomForm] = useState({
    number: "",
    floor: 1,
    type: "Standard",
    capacity: 2,
    price: 1600,
    status: "AVAILABLE",
    notes: ""
  });
  const [message, setMessage] = useState("");
  const floors = useMemo(() => {
    return rooms.reduce((acc, room) => {
      acc[room.floor] = [...(acc[room.floor] || []), room];
      return acc;
    }, {});
  }, [rooms]);

  async function updateStatus(id, status) {
    setMessage("");
    await api.updateRoomStatus(id, status);
    refresh();
  }

  async function createBooking(payload) {
    try {
      await api.createBooking(payload);
      setSelectedRoom(null);
      setMessage("Booking saved and room status updated.");
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function createRoom(event) {
    event.preventDefault();
    try {
      await api.createRoom(roomForm);
      setRoomForm({ number: "", floor: 1, type: "Standard", capacity: 2, price: 1600, status: "AVAILABLE", notes: "" });
      setShowRoomForm(false);
      setMessage("Room created successfully.");
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function deleteRoom(room) {
    if (!window.confirm(`Delete room ${room.number}? This is allowed only when the room has no booking history.`)) return;
    try {
      await api.deleteRoom(room.id);
      setMessage(`Room ${room.number} deleted.`);
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (loading) return <div className="text-slate-500">Loading rooms...</div>;
  if (error) return <div className="rounded-lg bg-rose-50 p-5 text-rose-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visual Room Rack</h2>
          <p className="text-slate-500 dark:text-slate-400">Floor-wise, touch-friendly room operations for reception desks.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={refresh}><RefreshCw size={17} /> Refresh</Button>
          <Button variant="secondary" onClick={() => setShowRoomForm(!showRoomForm)}><BedDouble size={17} /> Add Room</Button>
          <Button onClick={() => setSelectedRoom({})} disabled={!rooms.length}><Plus size={17} /> New Booking</Button>
        </div>
      </div>
      {message && <div className="rounded-lg bg-teal-50 p-4 text-sm font-medium text-teal-800 dark:bg-teal-950 dark:text-teal-100">{message}</div>}
      {showRoomForm && (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-bold">Add Room</h2>
              <p className="text-sm text-slate-500">Create your real room inventory floor by floor.</p>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={createRoom}>
              <div className="grid grid-cols-6 gap-3">
                <Input required placeholder="Room number" value={roomForm.number} onChange={(event) => setRoomForm({ ...roomForm, number: event.target.value })} />
                <Input required type="number" min="0" placeholder="Floor" value={roomForm.floor} onChange={(event) => setRoomForm({ ...roomForm, floor: event.target.value })} />
                <Select value={roomForm.type} onChange={(event) => setRoomForm({ ...roomForm, type: event.target.value })}>
                  <option>Standard</option>
                  <option>Deluxe AC</option>
                  <option>Family Suite</option>
                  <option>Dormitory</option>
                  <option>Custom</option>
                </Select>
                <Input required type="number" min="1" placeholder="Capacity" value={roomForm.capacity} onChange={(event) => setRoomForm({ ...roomForm, capacity: event.target.value })} />
                <Input required type="number" min="0" placeholder="Price per night" value={roomForm.price} onChange={(event) => setRoomForm({ ...roomForm, price: event.target.value })} />
                <Select value={roomForm.status} onChange={(event) => setRoomForm({ ...roomForm, status: event.target.value })}>
                  <option value="AVAILABLE">Available</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </Select>
              </div>
              <Textarea placeholder="Room notes, amenities, or maintenance details" value={roomForm.notes} onChange={(event) => setRoomForm({ ...roomForm, notes: event.target.value })} />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowRoomForm(false)}>Cancel</Button>
                <Button type="submit"><Save size={17} /> Save Room</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {selectedRoom && (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-bold">Create Booking</h2>
              <p className="text-sm text-slate-500">Automatic stay duration, payment balance, and double-booking prevention.</p>
            </div>
          </CardHeader>
          <CardContent>
            <BookingForm rooms={rooms} selectedRoom={selectedRoom.id ? selectedRoom : null} onSubmit={createBooking} onCancel={() => setSelectedRoom(null)} />
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        {!rooms.length && (
          <Card>
            <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <BedDouble size={26} />
              </div>
              <h3 className="mt-4 text-xl font-bold">No rooms created yet</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Start by adding your actual guest house rooms. Dashboard, bookings, billing, and analytics will begin from your real data only.</p>
              <Button className="mt-5" onClick={() => setShowRoomForm(true)}><Plus size={17} /> Add First Room</Button>
            </CardContent>
          </Card>
        )}
        {Object.entries(floors).map(([floor, floorRooms]) => (
          <section key={floor}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Floor {floor}</h3>
              <span className="text-sm text-slate-500">{floorRooms.length} rooms</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {floorRooms.map((room) => (
                <RoomCard key={room.id} room={room} onStatus={updateStatus} onReserve={setSelectedRoom} onDelete={deleteRoom} onDetails={() => setMessage(`Room ${room.number}: ${room.notes || "No extra notes."}`)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
