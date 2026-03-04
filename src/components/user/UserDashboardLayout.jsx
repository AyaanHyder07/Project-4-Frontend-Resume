import { useState, useEffect } from "react";
import UserSidebar from "./UserSidebar";
import UserTopbar from "./UserTopbar";
import "./user-layout.css";   // ← ONLY import here

const UserDashboardLayout = ({ title, subtitle, rightAction, children }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="dash-wrapper">

      {/* Mobile overlay */}
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      <UserSidebar open={open} setOpen={setOpen} />

      <div className="dash-main">
        <UserTopbar
          title={title}
          subtitle={subtitle}
          rightAction={rightAction}
          toggleSidebar={() => setOpen((prev) => !prev)}
        />
        <div className="dash-content">{children}</div>
      </div>

    </div>
  );
};

export default UserDashboardLayout;