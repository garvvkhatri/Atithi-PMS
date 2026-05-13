import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";
import { currency, shortDate } from "../lib/utils";

export function Expenses() {
  const { data, refresh } = useApi(api.expenses, []);
  const expenses = data ?? [];
  const [form, setForm] = useState({ category: "Electricity", description: "", amount: "", spentAt: new Date().toISOString().slice(0, 10) });
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  async function submit(event) {
    event.preventDefault();
    await api.createExpense(form);
    setForm({ ...form, description: "", amount: "" });
    refresh();
  }

  return (
    <div className="grid grid-cols-3 gap-5">
      <Card>
        <CardHeader><h2 className="text-xl font-bold">Add Expense</h2></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Electricity</option>
              <option>Water</option>
              <option>Salaries</option>
              <option>Maintenance</option>
              <option>Cleaning Supplies</option>
              <option>Miscellaneous</option>
            </Select>
            <Input required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input required type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input type="date" value={form.spentAt} onChange={(e) => setForm({ ...form, spentAt: e.target.value })} />
            <Button><Plus size={17} /> Add expense</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <div>
            <h2 className="text-xl font-bold">Expense Register</h2>
            <p className="text-sm text-slate-500">Total tracked expenses: {currency(total)}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
              <div>
                <div className="font-bold">{expense.category}</div>
                <div className="text-sm text-slate-500">{expense.description}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{currency(expense.amount)}</div>
                <div className="text-sm text-slate-500">{shortDate(expense.spentAt)}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
