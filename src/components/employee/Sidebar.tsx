import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-black text-white flex flex-col">

      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">
          GradCredit
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          Employee Portal
        </p>
      </div>

      <nav className="flex-1 px-4 py-6">

        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800">
          <LayoutDashboard size={20} />
          Dashboard
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800">
          <Users size={20} />
          Students
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800">
          <FileText size={20} />
          Applications
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800">
          <Building2 size={20} />
          Banks
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800">
          <Bell size={20} />
          Notifications
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800">
          <Settings size={20} />
          Settings
        </button>

      </nav>

      <div className="p-4 border-t border-gray-800">

        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-600">

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>
  );
}