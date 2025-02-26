import React from 'react';
import Link from 'next/link';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-1 flex-col">
        <div className="p-3">
          <Link href="/" className="inline-block text-0">
            <img
              src="/asset/icons/logo--dark.svg"
              alt="Logo"
              className="h-8 w-[122px]"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-3">
          <div className="max-w-[450px] w-full">{children}</div>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-b from-[#122647] to-[#090E23] text-white p-3">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-[24px] leading-[32px]">
              Welcome to{' '}
              <span className="text-[#15b79e]">NebaBilling</span>
            </h1>
            <p className="text-lg">
              A professional template that comes with ready-to-use Tailwind components.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              alt="Widgets"
              src="/asset/images/auth-widgets.png"
              className="max-w-[600px] w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
