"use client";

import { useTransition, useState, useEffect } from "react";
import { toggleUserSuspension, deleteUser, updateUserRole } from "./actions";
import { Trash2, Ban, CheckCircle, Loader2, Shield } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

export function UserActions({ userId, currentStatus, userRole }: { userId: string, currentStatus: string, userRole: string }) {
  const [isPending, startTransition] = useTransition();
  const [localRole, setLocalRole] = useState(userRole);
  const { toast } = useToast();
  const router = useRouter();

  
  useEffect(() => {
    setLocalRole(userRole);
  }, [userRole]);

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const res = await toggleUserSuspension(userId, currentStatus);
        if (res.success || res.mocked) {
          toast({ 
            title: res.mocked ? "Offline Simulation" : "Account Updated", 
            description: `User successfully ${currentStatus === "SUSPENDED" ? "restored" : "suspended"}.` 
          });
          router.refresh();
        } else {
          toast({ 
            title: "Action Failed", 
            description: res.error || "Could not update user status.",
            variant: "destructive"
          });
        }
      } catch (e) {
        toast({ title: "Error", description: "A system error occurred.", variant: "destructive" });
      }
    });
  };

  const handleRoleChange = (newRole: string) => {
    setLocalRole(newRole); 
    startTransition(async () => {
      try {
        const res = await updateUserRole(userId, newRole);
        if (res.success || res.mocked) {
          toast({ 
            title: res.mocked ? "Offline Simulation" : "Role Updated", 
            description: `User role changed to ${newRole}.` 
          });
          router.refresh();
        } else {
          setLocalRole(userRole); 
          toast({ 
            title: "Update Failed", 
            description: res.error || "Could not change user role.",
            variant: "destructive"
          });
        }
      } catch (e) {
        setLocalRole(userRole);
        toast({ title: "Error", description: "Failed to communicate with server.", variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this account?")) {
      startTransition(async () => {
        try {
          const res = await deleteUser(userId);
          if (res.success || res.mocked) {
            toast({ 
              title: res.mocked ? "Offline Simulation" : "User Deleted", 
              description: res.mocked ? "Database offline. User deletion simulated." : "Account forcefully purged." 
            });
            router.refresh();
          } else {
            toast({ 
              title: "Delete Failed", 
              description: res.error || "Could not remove user.",
              variant: "destructive"
            });
          }
        } catch (e) {
          toast({ title: "Error", description: "Deletion failed due to a system error.", variant: "destructive" });
        }
      });
    }
  };

  if (userId === "usr_1") return <span className="text-xs text-gray-600 italic">Global Admin</span>;

  return (
    <div className="flex items-center justify-end gap-3">
      <div className="relative">
        <select
          value={localRole}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={isPending}
          className="appearance-none bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold px-2 py-1 pr-7 rounded-md cursor-pointer hover:bg-purple-500/20 transition-all disabled:opacity-50 outline-none"
        >
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <Shield className="absolute right-1.5 top-1.5 w-3 h-3 text-purple-400 pointer-events-none" />
      </div>

      <button 
        onClick={handleToggle} 
        disabled={isPending}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all border ${
          currentStatus === "SUSPENDED" 
            ? "border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20" 
            : "border-orange-500/30 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
        } disabled:opacity-50`}
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : (currentStatus === "SUSPENDED" ? <CheckCircle className="w-3 h-3"/> : <Ban className="w-3 h-3"/>)}
        {currentStatus === "SUSPENDED" ? "Restore" : "Suspend"}
      </button>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>}
        Delete
      </button>
    </div>
  );
}
