import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

const permissions = {
  OWNER: ["Full access", "Analytics", "Delete records", "System settings", "Backup restore"],
  MANAGER: ["Bookings", "Room operations", "Expenses", "Reports"],
  RECEPTION: ["Check in/out", "Create bookings", "Print receipts", "No analytics or settings"]
};

export function Roles() {
  const { data } = useApi(api.users, []);
  const users = data ?? [];
  return (
    <div className="grid grid-cols-3 gap-5">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="font-bold">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold dark:bg-slate-900">{user.role}</div>
            <div className="space-y-2">
              {permissions[user.role].map((item) => <div key={item} className="rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">{item}</div>)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
