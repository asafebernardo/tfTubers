import { NavLink, Outlet } from "react-router-dom";
import { useCatalog } from "../catalog.jsx";

const links = [
  { to: "/", label: "Start" },
  { to: "/countries", label: "By Country" },
  { to: "/subscribers", label: "Most Subs" },
  { to: "/oldest", label: "Oldest TF2" },
  { to: "/videos", label: "Most Viewed" },
];

export default function Layout() {
  const { loading, error } = useCatalog();

  return (
    <div className="app-shell">
      <div className="team-stripe" />
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 72 48" width="64" height="42">
              <rect width="72" height="48" fill="#2a2118" />
              <path fill="#c44b32" d="M0 0h36v48H0z" />
              <path fill="#4b6c84" d="M36 0h36v48H36z" />
              <text x="36" y="33" textAnchor="middle" fill="#f4d19b" fontFamily="Arial Black, sans-serif" fontSize="22">
                2
              </text>
            </svg>
          </span>
          <span>
            <strong>TF2 TUBERS</strong>
            <em>Team Fortress 2 YouTube roster</em>
          </span>
        </NavLink>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="page">
        {error ? <p className="banner error">{error}</p> : null}
        {loading ? <p className="banner">Loading mercenaries…</p> : <Outlet />}
      </main>
      <footer className="foot">
        Add a YouTuber by putting their channel link in <code>channels.json</code> in this repository.
        When that file is updated, the site reloads the roster on its own.
      </footer>
    </div>
  );
}
