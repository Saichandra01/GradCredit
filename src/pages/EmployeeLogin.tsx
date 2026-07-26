import { useState } from "react";

interface EmployeeLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export default function EmployeeLogin({
  onLogin,
  onBack,
}: EmployeeLoginProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Backend API will be connected later
    console.log({
      employeeId,
      password,
    });

    onLogin();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">

        <h1 className="text-3xl font-bold text-center">
          GradCredit
        </h1>

        <p className="text-gray-500 text-center mt-2 mb-8">
          Employee Portal
        </p>

        <form onSubmit={handleLogin}>

          <div className="mb-5">

            <label className="block font-medium mb-2">
              Employee ID
            </label>

            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="EMP001"
              className="w-full border rounded-lg p-3"
            />

          </div>

          <div className="mb-6">

            <label className="block font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-lg p-3"
            />

          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg py-3"
          >
            Login
          </button>

        </form>

        <button
          onClick={onBack}
          className="w-full mt-4 border rounded-lg py-3"
        >
          Back to Website
        </button>

      </div>

    </div>
  );
}