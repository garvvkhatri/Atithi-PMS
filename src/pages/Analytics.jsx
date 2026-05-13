import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { StatCard } from "../components/StatCard";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { currency } from "../lib/utils";
import { BedDouble, Clock, Repeat, TrendingUp } from "lucide-react";

export function Analytics() {
  const { data, loading } = useApi(api.analytics, []);
  if (loading) return <div className="text-slate-500">Loading analytics...</div>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Repeat Customers" value={data.repeatCustomers} icon={Repeat} accent="bg-indigo-500" />
        <StatCard label="Average Stay" value={`${data.averageStay} nights`} icon={Clock} accent="bg-teal-500" />
        <StatCard label="Tracked Rooms" value={data.roomUsage.length} icon={BedDouble} accent="bg-slate-950" />
        <StatCard label="Top Room Revenue" value={currency(data.mostProfitableRooms[0]?.revenue || 0)} icon={TrendingUp} accent="bg-emerald-500" />
      </div>
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-xl font-bold">Most Profitable Rooms</h2>
            <p className="text-sm text-slate-500">Room revenue and usage statistics.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mostProfitableRooms}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="room" />
                <YAxis />
                <Tooltip formatter={(value) => currency(value)} />
                <Bar dataKey="revenue" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
