import { NavLink } from "react-router-dom";

const navItems: Array<{ to: string; label: string; end?: boolean }> = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/leads", label: "Leads", end: true },
  { to: "/leads/kanban", label: "Leads Kanban", end: true },
  { to: "/leads/new", label: "Add Lead" },
  { to: "/followups", label: "Follow-ups", end: true },
  { to: "/documents", label: "Documents", end: true },
  { to: "/reports", label: "Reports", end: true },
];

export const Sidebar = () => {
  return (
    <aside className="hidden w-56 flex-shrink-0 border-r bg-white/90 px-3 py-4 text-sm md:block">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 font-medium ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

