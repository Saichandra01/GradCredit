import employeeImage from "../../assets/employee.jpeg.png";
interface EmployeePortalProps {
  onEmployeeLogin: () => void;
}

export default function EmployeePortal({
  onEmployeeLogin,
}: EmployeePortalProps) {
  return (
    <section
  id="employee-portal"
  className="py-24 bg-white"
>
      <div className="max-w-7xl mx-auto px-6">

        <div className="rounded-3xl border bg-gradient-to-r from-white to-gray-50 shadow-xl overflow-hidden">

          <div className="grid lg:grid-cols-2 gap-10 items-center p-12">

            {/* Left Side */}

            <div>

              <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">
                Employee Portal
              </span>

              <h2 className="text-5xl font-bold mt-6">
                Manage Student Applications
              </h2>

              <p className="mt-6 text-lg text-gray-600 leading-8">
                Secure access for GradCredit employees to review student
                applications, verify documents, manage education loans,
                communicate with students, and process approvals.
              </p>

              <button
                onClick={onEmployeeLogin}
                className="mt-10 bg-black text-white px-8 py-4 rounded-xl text-lg hover:bg-gray-900 transition"
              >
                Employee Login
              </button>

            </div>

            {/* Right Side */}

            <div className="flex justify-center">

            <img
  src={employeeImage}
  alt="Employee Portal"
  className="w-full max-w-lg mx-auto"
 />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}