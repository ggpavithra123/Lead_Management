import { UserButton } from "@clerk/clerk-react";

export const Navbar = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          MNC Filings – Lead Management
        </h1>
        <p className="text-xs text-slate-500">
          Track enquiries, follow-ups, documents & conversions
        </p>
      </div>
      <UserButton afterSignOutUrl="/login" />
    </header>
  );
};
