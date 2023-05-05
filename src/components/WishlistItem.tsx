import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";

import { api } from "~/utils/api";

import { useState } from "react";
import { LoadingSpinner } from "./loading";

import { toast } from "react-hot-toast";

type WishlistItemWithUser =
  RouterOutputs["wishlistItem"]["getWishlistByUserId"][number];
const WishistItem = (props: WishlistItemWithUser) => {
  const { wishlistItem } = props;

  const ctx = api.useContext();

  const { mutate, isLoading } = api.wishlistItem.delete.useMutation({
    onSuccess: () => {
      void ctx.wishlistItem.getWishlistByUserId.invalidate();
    },
    onError: (err) => {
      const errMsg = err?.data?.zodError?.fieldErrors.content;
      if (errMsg && errMsg[0]) {
        toast.error(errMsg[0]);
      } else {
        toast.error("Unable to delete...");
      }
    },
  });

  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    mutate({
      id: wishlistItem.id,
    });
    setShowModal(false);
  };

  return (
    <div className="relative flex flex-col items-center gap-4 rounded-lg bg-slate-950 px-5 py-6 shadow-md">
      <button
        data-modal-target="popup-modal"
        data-modal-toggle="popup-modal"
        className="self-end rounded-lg bg-violet-500 px-3 py-2 text-center text-xs font-medium text-slate-950 hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-300"
        type="button"
        title="Delete wishlist item"
        onClick={() => setShowModal(true)}
      >
        Delete
      </button>

      <div
        id="popup-modal"
        tabIndex={-1}
        className={`fixed left-0 right-0 top-0 z-50 h-[calc(100%-1rem)] max-h-full items-center justify-center overflow-y-auto overflow-x-hidden p-4 md:inset-0 ${
          showModal ? "flex" : "hidden"
        }`}
      >
        <div className="relative max-h-full w-full max-w-md">
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
            <button
              type="button"
              className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-hide="popup-modal"
              onClick={() => setShowModal(false)}
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <svg
                aria-hidden="true"
                className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this?
              </h3>
              {isLoading && <LoadingSpinner />}
              <button
                data-modal-hide="popup-modal"
                type="button"
                onClick={handleDelete}
                className="mr-2 inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
              >
                Yes, I am sure
              </button>
              <button
                data-modal-hide="popup-modal"
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="text-center text-2xl font-semibold text-violet-300">
          {wishlistItem.title}
        </p>
        <p className="text-slate-400">{wishlistItem.author}</p>
      </div>
      <div>
        <p className="text-slate-700">{wishlistItem.description}</p>
      </div>
      <div className="rounded-lg bg-violet-400 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-violet-500">
        <Link href={wishlistItem.link} target="_blank">
          Buy Book
        </Link>
      </div>
    </div>
  );
};

export default WishistItem;
