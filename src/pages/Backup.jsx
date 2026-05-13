import { useState } from "react";
import { DatabaseBackup, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { api } from "../services/api";

export function Backup() {
  const [path, setPath] = useState("");
  const [message, setMessage] = useState("");

  async function backup() {
    const result = await api.backup();
    setMessage(`Backup created: ${result.path}`);
  }

  async function restore() {
    const result = await api.restore(path);
    setMessage(result.restored ? "Backup restored. Restart the app to reload the database connection." : "Restore failed.");
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-xl font-bold">Local Backup & Restore</h2>
          <p className="text-sm text-slate-500">SQLite backups are safe file copies and work fully offline.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button onClick={backup}><DatabaseBackup size={17} /> One-click backup</Button>
          <Input placeholder="Paste backup .db path to restore" value={path} onChange={(event) => setPath(event.target.value)} />
          <Button variant="secondary" onClick={restore}><RotateCcw size={17} /> Restore</Button>
        </div>
        <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Automatic daily backups can be wired through Electron startup or OS Task Scheduler using the same `/api/backups` endpoint.
        </div>
        {message && <div className="rounded-lg bg-teal-50 p-4 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-100">{message}</div>}
      </CardContent>
    </Card>
  );
}
