import Image from "next/image";
import React from "react";

interface Props {
  children: React.ReactNode;
}

function AuthLayout({ children }: Props) {
  return (
    <div className="h-screen w-screen">
      <div className="flex h-21 w-full items-center justify-between px-10">
        <div className="relative h-10 w-27.5">
          <Image alt="converge" className="object-cover" fill sizes="100%" src="/assets/images/converge-logo.png" />
        </div>
        <div className=""></div>
      </div>
      <div className="bg-auth grid h-[calc(100%-168px)] w-full place-items-center bg-cover bg-center bg-no-repeat">
        {children}
      </div>
      <div className="flex h-21 w-full items-center justify-between px-10">
        <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Heirs Technologies</p>
        <p className="text-sm text-gray-600">All rights reserved</p>
      </div>
    </div>
  );
}

export default AuthLayout;
