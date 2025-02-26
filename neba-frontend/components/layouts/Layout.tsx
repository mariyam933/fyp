import React from 'react';
import { useRouter } from 'next/router';
import { CircleUser, LayoutDashboard, Search, Settings, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuth } from '@/context/auth';
import Link from 'next/link';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const auth = useAuth();
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/overview' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Account', icon: CircleUser, path: '/account' },
  ];

  const isActive = (path: string) => router.pathname.startsWith(path);

  return (
    <>
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          />
        </svg>
      </button>
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-800">
          <img src="/asset/icons/logo.svg" alt="Logo" className="w-[120px] mb-10 ml-2" />
          <ul className="space-y-2 font-medium">
            {navItems.map(({ name, icon: Icon, path }) => (
              <li key={name}>
                <Link
                  href={path}
                  className={`flex items-center p-2 rounded-lg group ${isActive(path) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="ms-3">{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="sm:ml-64">
        <div className='flex justify-between items-center p-4 border-b border-gray-200'>
          <Search />
          <DropdownMenu>
            <DropdownMenuTrigger> <img src="/asset/images/avatar.png" className='rounded-full w-10 ml-auto' alt="image" /></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/overview')}>Overview</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/customers')}>Customer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/account')}>Account</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {auth.logout(); router.push('/')}}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='p-4'>
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
