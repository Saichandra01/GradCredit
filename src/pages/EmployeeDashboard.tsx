import Sidebar from "../components/employee/Sidebar";
import Header from "../components/employee/Header";
import DashboardCards from "../components/employee/DashboardCards";
import SearchBar from "../components/employee/SearchBar";
import StudentTable from "../components/employee/StudentTable";

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <main className="flex-1 p-8">

        <Header />

        <div className="mt-8">
          <DashboardCards />
        </div>

        <SearchBar />

        <StudentTable />

      </main>

    </div>
  );
}