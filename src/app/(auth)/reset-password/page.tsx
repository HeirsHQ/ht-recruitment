"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Lock } from "lucide-react";

import { validatePassword } from "@/lib/sanitize";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Page = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (password !== confirmPassword) {
      setErrors(["Passwords do not match"]);
      return;
    }

    // TODO: call API to reset password
    router.replace("/");
  };

  return (
    <div className="flex w-125 flex-col items-center gap-y-6 rounded-[10px] border bg-white p-6 shadow-md">
      <div className="relative grid size-22 place-items-center">
        <div className="absolute inset-0 rounded-full border [clip-path:inset(0_0_50%_0)]" />
        <div className="grid size-14 place-items-center rounded-full shadow-md">
          <Lock />
        </div>
      </div>
      <div className="space-y-1.5 text-center">
        <p className="text-3xl font-semibold">Reset your password</p>
        <p className="text-sm text-gray-600">Enter your new password below.</p>
      </div>
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="w-full space-y-3">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="w-full space-y-3">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.length) setErrors([]);
            }}
            required
          />
          {errors.length > 0 && (
            <ul className="space-y-0.5">
              {errors.map((err) => (
                <li key={err} className="text-xs text-red-500">
                  {err}
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-x-2">
            <Checkbox />
            <span className="text-xs font-medium">Keep me signed in</span>
          </div>
        </div>
        <Button className="w-full" type="submit">
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default Page;
