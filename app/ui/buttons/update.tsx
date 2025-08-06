import { PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function Update({ id, route }: { id: string, route: string }) {
    return (
      <Link
        href={`/dashboard/${route}/${id}/edit`}
        className="rounded-md inline-block border p-2 hover:bg-gray-100"
      >
        <PencilIcon className="w-5" />
      </Link>
    );
  }