
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

interface LayoutProps {
  title?: string;
}

export default function Layout({ title = "Dashboard" }: LayoutProps) {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
