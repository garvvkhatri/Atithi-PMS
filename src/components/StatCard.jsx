import { motion } from "framer-motion";
import { Card } from "./ui/Card";

export function StatCard({ label, value, icon: Icon, accent = "bg-teal-500", hint }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
            {hint && <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
          </div>
          <div className={`${accent} grid h-12 w-12 place-items-center rounded-lg text-white shadow-lg`}>
            <Icon size={22} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
