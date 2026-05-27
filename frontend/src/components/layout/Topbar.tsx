"use client";

import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      logout();
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#0a0a0c]/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:flex items-center">
          <Search className="absolute left-3 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Search projects, tasks, notes..."
            className="h-9 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Bell size={18} />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-primary" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all">
              <AvatarImage src={user?.avatar || ""} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {user?.username?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#111115] border-white/10 text-white shadow-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username || "User"}</p>
                  <p className="text-xs leading-none text-white/50">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
