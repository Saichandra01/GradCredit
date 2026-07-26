import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Employee Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome back to GradCredit
        </p>
      </div>

      <div className="flex items-center gap-4">

        {/* Search */}

        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-72">

          <Search size={18} className="text-gray-500" />

          <input
            type="text"
            placeholder="Search Student..."
            className="bg-transparent outline-none ml-2 w-full"
          />

        </div>

        {/* Notification */}

        <button className="relative p-3 bg-gray-100 rounded-lg">

          <Bell size={22} />

          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>

        </button>

        {/* Employee Profile */}

        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-full bg-black text-white flex items-center justify-center font-bold">
            S
          </div>

          <div>

            <p className="font-semibold">
              Sai Chandra
            </p>

            <p className="text-sm text-gray-500">
              Loan Officer
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}