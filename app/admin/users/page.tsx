import { prisma } from "@/lib/prisma";
import { UserActions } from "./UserActions";
import { Users as UsersIcon } from "lucide-react";
import { getMockUserState } from "@/lib/demo-state";
import { auth } from "@/auth";

async function getUsers() {
  const session = await auth();
  const adminId = session?.user?.id || "default_admin";
  const mockOverrides = await getMockUserState(adminId);
  
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    if (users.length === 0) {
      return applyOverrides(MOCK_USERS, mockOverrides);
    }

    
    const mergedUsers = users.map((user: any) => {
      if (mockOverrides[user.id]) {
        return { ...user, ...mockOverrides[user.id] };
      }
      return user;
    }).filter((user: any) => user.status !== "DELETED");

    return mergedUsers;
  } catch (error) {
    console.warn("DB Offline: Using user simulation mode.");
    return applyOverrides(MOCK_USERS, mockOverrides);
  }
}

function applyOverrides(users: any[], overrides: any) {
  return users
    .map(user => {
      if (overrides[user.id]) {
        return { ...user, ...overrides[user.id] };
      }
      return user;
    })
    .filter(user => user.status !== "DELETED");
}

const MOCK_USERS = [
  { id: "usr_1", name: "Demo Founder", email: "admin@novadrop.com", role: "ADMIN", status: "ACTIVE", createdAt: new Date() },
  { id: "usr_2", name: "Local Shopper", email: "shopper@gmail.com", role: "CUSTOMER", status: "ACTIVE", createdAt: new Date(Date.now() - 50000) },
  { id: "usr_3", name: "Bad Actor", email: "fraud@fake.com", role: "CUSTOMER", status: "SUSPENDED", createdAt: new Date(Date.now() - 90000000) },
];

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-1">User Management</h1>
        <p className="text-gray-500">Control role-based access, suspend accounts, or purge data immediately.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Account</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Registration</th>
              <th className="text-right px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-white/2 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{user.name || "Unnamed User"}</p>
                  <p className="text-xs text-gray-500 font-mono">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" : "bg-gray-500/20 text-gray-400"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {user.status || "ACTIVE"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <UserActions userId={user.id} currentStatus={user.status || "ACTIVE"} userRole={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
