"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useFormik } from "formik";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MicrosoftIcon } from "@/assets/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(100, "Username is too long")
    .transform((val) => sanitizeText(val)),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof schema>;

function validate(values: SignInValues) {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const errors: Partial<Record<keyof SignInValues, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof SignInValues;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

const Page = () => {
  const router = useRouter();

  const { handleChange, handleSubmit, errors, touched, handleBlur } = useFormik<SignInValues>({
    initialValues: {
      username: "",
      password: "",
    },
    validate,
    onSubmit: async (values) => {
      try {
        console.log({ values });
        toast.success("Signed in successfully");
        router.replace("/dashboard");
      } catch (error) {
        toast.error("Invalid credentials");
        console.error(error);
      }
    },
  });

  return (
    <div className="flex w-125 flex-col items-center gap-y-6 rounded-[10px] border bg-white p-6 shadow-md">
      <div className="relative grid size-22 place-items-center">
        <div className="absolute inset-0 rounded-full border [clip-path:inset(0_0_50%_0)]" />
        <div className="grid size-14 place-items-center rounded-full shadow-md">
          <User />
        </div>
      </div>
      <div className="space-y-1.5 text-center">
        <p className="text-3xl font-semibold">Sign In</p>
        <p className="text-sm text-gray-600">Welcome back! Please sign in to continue.</p>
      </div>
      <Button className="w-full" size="sm" variant="outline">
        <MicrosoftIcon /> Microsoft
      </Button>
      <div className="relative flex w-full items-center justify-center before:absolute before:top-1/2 before:left-0 before:h-px before:w-full before:translate-y-1/2 before:bg-gray-300">
        <span className="z-1! bg-white px-3 text-xs text-gray-600">OR</span>
      </div>
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="w-full space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" onChange={handleChange} onBlur={handleBlur} type="text" />
          {touched.username && errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
        </div>
        <div className="w-full space-y-1.5">
          <div className="flex w-full items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link className="link text-sm text-gray-600" href="/forgot-password">
              Forgot your password?
            </Link>
          </div>
          <Input id="password" name="password" onChange={handleChange} onBlur={handleBlur} type="password" />
          {touched.password && errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          <div className="flex items-center gap-x-2">
            <Checkbox />
            <span className="text-xs font-medium">Keep me signed in</span>
          </div>
        </div>
        <Button className="w-full" type="submit">
          Sign In
        </Button>
      </form>
      <div className="text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link className="link text-black" href="/">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Page;
