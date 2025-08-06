import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function WorkerTabs({ id, route }: { id: string, route: string }) {
    return (
      <Link
        href={`/dashboard/${route}/${id}/`}
        className="rounded-md inline-block border p-2 hover:bg-gray-100"
      >
        <ClipboardDocumentListIcon className="w-5" />
      </Link>
    );
  }