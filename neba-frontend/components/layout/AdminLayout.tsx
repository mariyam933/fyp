import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="py-6">{children}</main>
    </div>
  );
}
