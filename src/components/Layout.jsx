import { motion } from "framer-motion";
import { BarChart3, BedDouble, CalendarCheck, CreditCard, DatabaseBackup, Hotel, IndianRupee, LayoutDashboard, Moon, Search, Settings, Sun, Users } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { cn } from "../lib/utils";

const nav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "rooms", label: "Rooms", icon: BedDouble },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "groups", label: "Functions", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "expenses", label: "Expenses", icon: IndianRupee },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "backup", label: "Backup", icon: DatabaseBackup },
  { id: "roles", label: "Roles", icon: Settings }
];

export function Layout({ active, setActive, dark, setDark, children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_28%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] text-slate-950 transition dark:bg-[radial-gradient(circle_at_top_left,#134e4a,transparent_24%),linear-gradient(135deg,#020617_0%,#111827_52%,#020617_100%)] dark:text-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 w-72 border-r border-white/50 bg-white/70 px-4 py-5 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white shadow-glow dark:bg-white dark:text-slate-950">
            <Hotel size={24} />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">Atithi PMS</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Offline hotel command center</div>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={cn(
                  "relative flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition",
                  selected ? "text-slate-950 dark:text-white" : "text-slate-500 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                )}
              >
                {selected && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-white shadow-premium dark:bg-slate-900" />}
                <Icon className="relative" size={19} />
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-slate-200/80 bg-white/75 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="font-semibold">Current role</div>
          <div className="mt-1 text-slate-500 dark:text-slate-400">Owner access enabled</div>
        </div>
      </aside>
      <main className="pl-72">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-white/60 bg-white/55 px-8 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/45">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Premium guest house management</div>
            <h1 className="text-2xl font-bold tracking-tight">{nav.find((item) => item.id === active)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input className="pl-10" placeholder="Search guests, rooms, bookings, events" />
            </div>
            <Button variant="secondary" onClick={() => setDark(!dark)} title="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
