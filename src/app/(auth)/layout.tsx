"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

interface Props {
  children: React.ReactNode;
}

function AuthLayout({ children }: Props) {
  return (
    <div className="h-screen w-screen">
      <motion.div
        className="flex h-21 w-full items-center justify-between px-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative h-10 w-27.5">
          <Image alt="converge" className="object-cover" fill sizes="100%" src="/assets/images/converge-logo.png" />
        </div>
        <div className=""></div>
      </motion.div>
      <div className="bg-auth grid h-[calc(100%-168px)] w-full place-items-center bg-cover bg-center bg-no-repeat">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
      <motion.div
        className="flex h-21 w-full items-center justify-between px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Heirs Technologies</p>
        <p className="text-sm text-gray-600">All rights reserved</p>
      </motion.div>
    </div>
  );
}

export default AuthLayout;
