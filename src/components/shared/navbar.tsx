import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="bg-primary-500 flex h-20 w-full items-center">
      <div className="container mx-auto flex items-center justify-between">
        <Link className="relative aspect-[2.7/1] w-25" href="/">
          <Image src="/assets/images/converge-logo.png" alt="logo" layout="fill" className="object-cover" />
        </Link>
        <div className=""></div>
      </div>
    </nav>
  );
};
