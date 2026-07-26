import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">

      <h2 className="text-xl font-bold mb-5">
        Search Student
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="Student Email"
          className="border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Application ID"
          className="border rounded-lg p-3"
        />

        <button className="bg-black text-white rounded-lg flex items-center justify-center gap-2">
          <Search size={18} />
          Search
        </button>

      </div>

    </div>
  );
}