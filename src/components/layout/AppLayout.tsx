import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
