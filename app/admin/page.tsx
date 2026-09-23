import Link from "next/link";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata = {
  title: "Archive admin",
};

export default function AdminPage() {
  return (
    <div className="khadi-grain min-h-dvh">
      <div className="flag-bar h-1.5 w-full" />
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
        <Link
          href="/"
          className="font-ui text-[11px] tracking-[0.18em] text-earth uppercase hover:text-saffron-deep"
        >
          Back to the inquiry
        </Link>
        <div className="paper-card mt-5 rounded-[28px] border border-earth/10 px-5 py-8 sm:px-8">
          <AdminPanel />
        </div>
      </div>
    </div>
  );
}
