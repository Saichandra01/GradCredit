export default function StudentTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border mt-8">

      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">
          Student Applications
        </h2>
      </div>

      <table className="w-full">

        <thead>

          <tr className="bg-gray-50">

            <th className="text-left p-4">Application ID</th>

            <th className="text-left p-4">Student</th>

            <th className="text-left p-4">Email</th>

            <th className="text-left p-4">Phone</th>

            <th className="text-left p-4">Country</th>

            <th className="text-left p-4">University</th>

            <th className="text-left p-4">Status</th>

            <th className="text-left p-4">Action</th>

          </tr>

        </thead>

        <tbody>

          <tr>

            <td className="p-4">--</td>

            <td className="p-4">--</td>

            <td className="p-4">--</td>

            <td className="p-4">--</td>

            <td className="p-4">--</td>

            <td className="p-4">--</td>

            <td className="p-4">--</td>

            <td className="p-4">

              <button className="bg-black text-white px-4 py-2 rounded-lg">
                View
              </button>

            </td>

          </tr>

        </tbody>

      </table>

    </div>
  );
}