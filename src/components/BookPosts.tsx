import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";

import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";

import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSpinner } from "./loading";

import { LikeBtn } from "./LikeBtn";
import { Rating } from "./Rating";

dayjs.extend(relativeTime);

type BookPostWithUser = RouterOutputs["books"]["getAll"][number];
const BookPosts = (props: BookPostWithUser) => {
  const { isSignedIn, user: clerkUser } = useUser();
  const { book, user } = props;

  const { mutate, isLoading, isSuccess, isError } =
    api.wishlistItem.create.useMutation();

  const addToWishlist = () => {
    mutate({
      title: book.title,
      author: book.author,
      description: book.description,
      link: `https://amazon.com/s?k=${book.title}+${book.author}`,
    });
  };

  if (isError) {
    toast.error("Unable to add to wishlist, try again later!");
  }

  const matchedUser = clerkUser?.id === user.id;

  return (
    <div className="m-auto flex max-w-xs flex-col items-center rounded-lg bg-slate-950 p-3 md:max-w-2xl md:flex-row">
      <Link title="Book Info" href={`/book/${book.id}`} className="p-3">
        <Image
          src={
            book.imgSrc
              ? book.imgSrc
              : "https://placehold.co/200x250?text=Book+Cover&font=roboto"
          }
          alt={book.title}
          width={200}
          height={200}
          className="w-50 rounded object-cover shadow-sm shadow-slate-400 md:h-auto md:w-60"
        />
      </Link>
      <div className="flex w-full flex-col justify-between gap-1 p-4 leading-normal">
        <div className="mb-5 flex items-center justify-between text-gray-500 flex-wrap gap-2">
          <span className="text-primary-800 inline-flex items-center rounded-lg bg-violet-600 px-2 py-0.5 text-xs font-medium text-slate-100">
            {book.genre}
          </span>
          <span className="text-sm text-slate-700">{`⁘ ${dayjs(
            book.createdAt
          ).fromNow()}`}</span>
        </div>
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-violet-300">
          <Link title="Book Info" href={`/book/${book.id}`}>
            {book.title}
          </Link>
        </h2>
        <div className="mb-4 text-slate-700">
          <Rating rating={book.rating} />
        </div>
        <p className="mb-3 max-w-sm text-sm text-slate-700">
          {book.description.slice(0, 100)}...
        </p>
        <div className="mb-3 flex items-center justify-between">
          {isSignedIn && !matchedUser && (
            <button
              onClick={() => {
                addToWishlist();
              }}
              title="Add to wishlist"
              disabled={isLoading || isSuccess}
              className="rounded bg-violet-500 p-1 text-xs font-medium text-slate-950 transition-colors hover:bg-violet-400"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : isSuccess ? (
                "Added!"
              ) : (
                "+ to wishlist"
              )}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
              <Link
                title={`@${user.externalUsername ?? user.name}'s profile`}
                href={`/@${user?.username ? user.username : user.name}`}
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-600">
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
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                </div>
              </Link>

              <div className="text-sm">
                <Link
                  title={`@${user.externalUsername ?? user.name}'s profile`}
                  href={`/@${user?.username ? user.username : user.name}`}
                >
                  <p className="leading-none text-slate-700">
                    {user?.username ? user.username : user?.name}
                  </p>
                </Link>
              </div>
          </div>
          {isSignedIn && <LikeBtn id={book.id} />}
        </div>
      </div>
    </div>
    // <div
    //   key={book.id}
    //   className="max-w-xs overflow-hidden rounded bg-slate-950 py-4 shadow-lg"
    // >
    //   <Link title="Book Info" href={`/book/${book.id}`}>
    //     <Image
    //       src={
    //         book.imgSrc
    //           ? book.imgSrc
    //           : "https://placehold.co/200x250?text=Book+Cover&font=roboto"
    //       }
    //       alt={book.title}
    //       width={200}
    //       height={250}
    //       className="m-auto flex justify-center rounded object-cover shadow-sm shadow-slate-400"
    //     />
    //   </Link>
    //   <div className="px-5 py-4">
    //     <div className="mb-2 text-xl font-bold text-violet-300">
    //       <Link title="Book Info" href={`/book/${book.id}`}>
    //         {book.title}
    //       </Link>
    //     </div>
    //     <div className="text-slate-700 pb-2">
    //       <Rating rating={book.rating} />
    //     </div>

    //     <p className="text-sm text-slate-700">
    //       {book.description.slice(0, 100)}...
    //     </p>
    //     <div className="mt-2 flex items-center justify-between">
    //       {isSignedIn && !matchedUser && (
    //         <button
    //           onClick={() => {
    //             addToWishlist();
    //           }}
    //           title="Add to wishlist"
    //           disabled={isLoading || isSuccess}
    //           className="rounded bg-violet-500 p-1 text-xs font-medium text-slate-950 transition-colors hover:bg-violet-400"
    //         >
    //           {isLoading ? (
    //             <LoadingSpinner />
    //           ) : isSuccess ? (
    //             "Added!"
    //           ) : (
    //             "+ to wishlist"
    //           )}
    //         </button>
    //       )}
    //       {isSignedIn && <LikeBtn id={book.id} />}
    //     </div>
    //   </div>
    //   <div className="flex items-center gap-2 px-5 py-2">
    //     <Link
    //       title={`@${user.externalUsername ?? user.name}'s profile`}
    //       href={`/@${user?.username ? user.username : user.name}`}
    //     >
    //       <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-600">
    //         {user?.profileImageUrl ? (
    //           <Image
    //             src={user.profileImageUrl}
    //             alt={user.name}
    //             width={48}
    //             height={48}
    //           />
    //         ) : (
    //           <svg
    //             className="absolute -left-1 h-10 w-10 text-gray-400"
    //             fill="currentColor"
    //             viewBox="0 0 20 20"
    //             xmlns="http://www.w3.org/2000/svg"
    //           >
    //             <path
    //               fillRule="evenodd"
    //               d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
    //               clipRule="evenodd"
    //             ></path>
    //           </svg>
    //         )}
    //       </div>
    //     </Link>

    //     <div className="text-sm">
    //       <Link
    //         title={`@${user.externalUsername ?? user.name}'s profile`}
    //         href={`/@${user?.username ? user.username : user.name}`}
    //       >
    //         <p className="leading-none text-slate-700">
    //           {user?.username ? user.username : user?.name}
    //           <span className="text-xs">{` ⁘ ${dayjs(
    //             book.createdAt
    //           ).fromNow()}`}</span>
    //         </p>
    //       </Link>
    //     </div>
    //   </div>
    // </div>
  );
};

export default BookPosts;
