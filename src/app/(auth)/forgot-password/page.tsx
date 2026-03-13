"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Lock } from "lucide-react";

import { OtpInput } from "@/components/shared/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "email" | "otp";

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendCode = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: call API to send OTP to email
    setStep("otp");
  };

  const handleVerifyOtp = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: call API to verify OTP
    router.push("/reset-password");
  };

  return (
    <div className="flex w-125 flex-col items-center gap-y-6 rounded-[10px] border bg-white p-6 shadow-md">
      <div className="relative grid size-22 place-items-center">
        <div className="absolute inset-0 rounded-full border [clip-path:inset(0_0_50%_0)]" />
        <div className="grid size-14 place-items-center rounded-full shadow-md">
          <Lock />
        </div>
      </div>

      {step === "email" && (
        <>
          <div className="space-y-1.5 text-center">
            <p className="text-3xl font-semibold">Forgot your password?</p>
            <p className="text-sm text-gray-600">
              Enter your email address and we&apos;ll send you password reset instructions.
            </p>
          </div>
          <form className="w-full space-y-4" onSubmit={handleSendCode}>
            <div className="w-full space-y-3">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit">
              Send Code
            </Button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <div className="space-y-1.5 text-center">
            <p className="text-3xl font-semibold">Check your email</p>
            <p className="text-sm text-gray-600">
              We sent a 6-digit code to <span className="font-medium text-black">{email}</span>. Enter it below to
              continue.
            </p>
          </div>
          <form className="w-full space-y-4" onSubmit={handleVerifyOtp}>
            <OtpInput value={otp} onChange={setOtp} />
            <Button className="w-full" type="submit" disabled={otp.length < 6}>
              Continue
            </Button>
          </form>
          <button
            type="button"
            className="cursor-pointer text-sm text-gray-600 hover:underline"
            onClick={() => console.log("resend")}
          >
            Didn&apos;t receive a code? <span className="font-medium text-black">Resend</span>
          </button>
        </>
      )}
    </div>
  );
};

export default Page;
