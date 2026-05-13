import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Dashboard } from "./Dashboard";
import { Rooms } from "./Rooms";
import { Bookings } from "./Bookings";
import { Groups } from "./Groups";
import { Billing } from "./Billing";
import { Expenses } from "./Expenses";
import { Analytics } from "./Analytics";
import { Backup } from "./Backup";
import { Roles } from "./Roles";

const pages = {
  dashboard: Dashboard,
  rooms: Rooms,
  bookings: Bookings,
  groups: Groups,
  billing: Billing,
  expenses: Expenses,
  analytics: Analytics,
  backup: Backup,
  roles: Roles
};

export function App() {
  const [active, setActive] = useState("dashboard");
  const [dark, setDark] = useState(false);
  const Page = pages[active];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <Layout active={active} setActive={setActive} dark={dark} setDark={setDark}>
      <Page setActive={setActive} />
    </Layout>
  );
}
