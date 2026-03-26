"use client";

import Image from "next/image";
import Link from "next/link";

import { useGlobalStore } from "@/store/core";

export const Navbar = () => {
  const { theme } = useGlobalStore();

  const image = theme === "dark" ? "/assets/images/converge-logo.png" : "/assets/images/converge-logo.png";

  return (
    <nav className="bg-primary-500 flex h-20 w-full items-center">
      <div className="container mx-auto flex items-center justify-between">
        <Link className="relative aspect-[2.8/1] w-25" href="/">
          <Image src={image} alt="logo" layout="fill" className="object-cover" />
        </Link>
        <div className=""></div>
      </div>
    </nav>
  );
};
