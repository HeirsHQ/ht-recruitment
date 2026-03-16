import Image from "next/image";

export const Navbar = () => {
  return (
    <nav className="w-full py-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="relative aspect-[2.7/1] w-25">
          <Image src="/assets/images/converge-logo.png" alt="logo" layout="fill" className="object-cover" />
        </div>
        <div className=""></div>
      </div>
    </nav>
  );
};
