import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";

import { useUser } from "@clerk/nextjs";

import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type BookPostWithUser = RouterOutputs["books"]["getAll"][number];
const BookPosts = (props: BookPostWithUser) => {
  const { isSignedIn } = useUser();
  const { book, user } = props;
  return (
    <div
      key={book.id}
      className="max-w-xs overflow-hidden rounded bg-slate-950 py-4 shadow-lg"
    >
      <Image
        src={
          book.imgSrc
            ? book.imgSrc
            : "https://placehold.co/200x250?text=Book+Cover&font=roboto"
        }
        alt={book.title}
        width={200}
        height={250}
        className="m-auto flex justify-center rounded object-cover shadow-sm shadow-slate-400"
      />
      <div className="px-5 py-4">
        <div className="mb-2 text-xl font-bold text-violet-300">
          <Link href={`/book/${book.id}`}>{book.title}</Link>
        </div>

        <p className="text-sm text-slate-700">
          {book.description.slice(0, 100)}...
        </p>
        {isSignedIn && (
          <div className="mt-2">
            <button className="rounded bg-violet-500 p-1 text-xs font-medium text-slate-950 transition-colors hover:bg-violet-400">
              + to wishlist
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-5 py-2">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600">
          {user?.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt={user.name}
              width={48}
              height={48}
            />
          ) : (
            <svg
              className="absolute -left-1 h-10 w-10 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              ></path>
            </svg>
          )}
        </div>

        <div className="text-sm">
          <Link href={`/@${user?.username ? user.username : user.name}`}>
            <p className="leading-none text-slate-700">
              {user?.username ? user.username : user?.name}
              <span className="text-xs">{` ⁘ ${dayjs(
                book.createdAt
              ).fromNow()}`}</span>
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookPosts;
