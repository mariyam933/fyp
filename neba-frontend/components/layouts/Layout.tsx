import React from 'react';
import { useRouter } from 'next/router';
import { CircleUser, LayoutDashboard, Search, Gauge, Settings, ReceiptText, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuth } from '@/context/auth';
import Link from 'next/link';
import { useEffect } from "react";


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const auth = useAuth();

  const userRole = auth?.user?.role;

  const rolePermissions: Record<string, string[]> = {
    "1": ["/overview", "/admins", "/customers", "/meter-reader", "/bills", "/settings", "/account"],
    "2": ["/overview", "/customers", "/meter-reader", "/bills", "/settings", "/account"],
    "3": ["/overview", "/bills", "/account"],
  };

  // useEffect(() => {
  //   if (userRole && !rolePermissions[userRole]?.includes(router.pathname)) {
  //     router.replace("/overview");
  //   }
  // }, [router.pathname, userRole]);
  useEffect(() => {
    if (userRole) {
      const allowedPaths = rolePermissions[userRole] || [];
      
      // Check if exact match or dynamic customer route
      if (!allowedPaths.includes(router.pathname) && !router.pathname.startsWith("/customers/")) {
        router.replace("/overview");
      }
    }
  }, [router.pathname, userRole]);
  

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/overview" },
    ...(userRole === "1" ? [{ name: "Admins", icon: Users, path: "/admins" }] : []),
    { name: "Customers", icon: Users, path: "/customers" },
    { name: "Meter Readers", icon: Gauge, path: "/meter-reader" },
    { name: "Bills", icon: ReceiptText, path: "/bills" },
    { name: "Settings", icon: Settings, path: "/settings" },
    { name: "Account", icon: CircleUser, path: "/account" },
  ].filter((item) => rolePermissions[userRole ?? "3"]?.includes(item.path));

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800">
        <div className="h-full px-3 py-4 overflow-y-auto">
          <img src="/asset/icons/logo.svg" alt="Logo" className="w-[120px] mb-10 ml-2" />
          <ul className="space-y-2 font-medium">
            {navItems.map(({ name, icon: Icon, path }) => (
              <li key={name}>
                <Link
                  href={path}
                  className={`flex items-center p-2 rounded-lg group ${
                    (router.pathname === path || (path === "/bills" && router.pathname.startsWith("/customers/"))) 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                  
                  // className={`flex items-center p-2 rounded-lg group ${router.pathname === path ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    // }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="ml-3">{name}</span>
                </Link>
              </li>
            ))}
          </ul>


        </div>
      </aside>

      {/* Main Content */}
      <div className="sm:ml-64 w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <Search />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <img src="/asset/images/avatar.png" className="rounded-full w-10 ml-auto" alt="User Avatar" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  auth.logout();
                  router.push("/");
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;