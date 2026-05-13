import { Activity, BedDouble, CalendarDays, IndianRupee, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/StatCard";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { currency, shortDate } from "../lib/utils";

export function Dashboard({ setActive }) {
  const { data, loading, error } = useApi(api.dashboard, []);
  if (loading) return <div className="text-slate-500">Loading dashboard...</div>;
  if (error) return <div className="rounded-lg bg-rose-50 p-5 text-rose-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Rooms" value={data.totalRooms} icon={BedDouble} accent="bg-slate-950" />
        <StatCard label="Occupied" value={data.occupiedRooms} icon={Activity} accent="bg-rose-500" hint={`${data.occupancyPercentage}% occupancy`} />
        <StatCard label="Available" value={data.availableRooms} icon={Sparkles} accent="bg-emerald-500" />
        <StatCard label="Monthly Revenue" value={currency(data.monthlyRevenue)} icon={IndianRupee} accent="bg-teal-500" />
        <StatCard label="Reserved" value={data.reservedRooms} icon={CalendarDays} accent="bg-violet-500" />
        <StatCard label="Cleaning" value={data.cleaningRooms} icon={Sparkles} accent="bg-amber-500" />
        <StatCard label="Pending Payments" value={currency(data.pendingPayments)} icon={WalletCards} accent="bg-orange-500" />
        <StatCard label="Net Earnings" value={currency(data.monthlyProfit)} icon={TrendingUp} accent="bg-cyan-600" hint={`${currency(data.monthlyExpenses)} expenses`} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-2">
          <CardHeader>
            <div>
              <h2 className="text-lg font-bold">Revenue Trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Six month performance with offline booking data</p>
            </div>
            <Button variant="secondary" onClick={() => setActive("analytics")}>Analytics</Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => currency(value)} />
                  <Area type="monotone" dataKey="revenue" stroke="#0f766e" fill="url(#revenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-bold">Occupancy</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Room usage by month</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="occupancy" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardHeader><h2 className="text-lg font-bold">Recent Bookings</h2></CardHeader>
          <CardContent className="space-y-3">
            {data.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <div>
                  <div className="font-semibold">{booking.guest.fullName}</div>
                  <div className="text-sm text-slate-500">Room {booking.room.number} · {shortDate(booking.checkIn)} to {shortDate(booking.checkOut)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{currency(booking.totalAmount)}</div>
                  <div className="text-xs text-slate-500">{booking.paymentStatus}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-bold">Upcoming Checkouts</h2></CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingCheckouts.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <div>
                  <div className="font-semibold">{booking.guest.fullName}</div>
                  <div className="text-sm text-slate-500">Room {booking.room.number}</div>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-sm font-semibold dark:bg-slate-950">{shortDate(booking.checkOut)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
