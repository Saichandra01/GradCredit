import {
  Users,
  Clock3,
  CheckCircle,
  XCircle,
  Building2,
  FileText,
} from "lucide-react";

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      <Card
        title="Total Students"
        value="--"
        icon={<Users size={28} />}
      />

      <Card
        title="Pending Review"
        value="--"
        icon={<Clock3 size={28} />}
      />

      <Card
        title="Approved"
        value="--"
        icon={<CheckCircle size={28} />}
      />

      <Card
        title="Rejected"
        value="--"
        icon={<XCircle size={28} />}
      />

      <Card
        title="Sent To Banks"
        value="--"
        icon={<Building2 size={28} />}
      />

      <Card
        title="New Applications"
        value="--"
        icon={<FileText size={28} />}
      />

    </div>
  );
}

type CardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
};

function Card({ title, value, icon }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          {icon}
        </div>

      </div>

    </div>
  );
}