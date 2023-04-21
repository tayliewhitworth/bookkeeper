import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";

type BookPostWithUser = RouterOutputs["books"]["getAll"][number];
const BookPosts = (props: BookPostWithUser) => {
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
        className="m-auto flex justify-center rounded object-cover shadow-sm shadow-slate-400"
      />
      <div className="px-5 py-4">
        <div className="mb-2 text-xl font-bold text-violet-300">
          {book.title}
        </div>
        <p className="text-sm text-slate-700">
          {book.description.slice(0, 100)}...
        </p>
      </div>
      <div className="flex items-center gap-2 px-5 py-2">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={user.name} />
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
          <p className="leading-none text-slate-700">
            {user?.username ? user.username : user?.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookPosts;
