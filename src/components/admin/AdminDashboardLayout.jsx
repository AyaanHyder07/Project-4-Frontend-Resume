import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar  from "./AdminTopbar";
import "./admin-layout.css";  // ← ONLY import here

const AdminDashboardLayout = ({ title, subtitle, rightAction, children }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="admin-wrapper">

      {/* Mobile overlay */}
      <div
        className={`admin-overlay ${open ? "visible" : ""}`}
        onClick={() => setOpen(false)}
      />

      <AdminSidebar open={open} setOpen={setOpen} />

      <div className="admin-main">
        <AdminTopbar
          title={title}
          subtitle={subtitle}
          rightAction={rightAction}
          toggleSidebar={() => setOpen((p) => !p)}
        />
        <main className="admin-content">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AdminDashboardLayout;