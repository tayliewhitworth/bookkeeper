import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";

import { api } from "~/utils/api";

import { useState } from "react";
import { LoadingSpinner } from "./loading";

import { toast } from "react-hot-toast";

type WishlistItemWithUser =
  RouterOutputs["wishlistItem"]["getWishlistByUserId"][number];
export const WishistItem = (props: WishlistItemWithUser) => {
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
        className="flex items-center self-end rounded-lg bg-violet-500 px-3 py-2 text-center text-xs font-medium text-slate-950 hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-300"
        type="button"
        title="Delete wishlist item"
        onClick={() => setShowModal(true)}
      >
        <svg
          className="-ml-1 mr-1 h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
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
          <div className="relative rounded-lg shadow bg-gray-700">
            <button
              type="button"
              className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
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
                className="mx-auto mb-4 h-14 w-14 text-gray-200"
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
              <h3 className="mb-5 text-lg font-normal text-gray-400">
                Are you sure you want to delete this?
              </h3>
              {isLoading && <LoadingSpinner />}
              <button
                data-modal-hide="popup-modal"
                type="button"
                onClick={handleDelete}
                className="mr-2 inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-800"
              >
                Yes, I am sure
              </button>
              <button
                data-modal-hide="popup-modal"
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border  px-5 py-2.5 text-sm font-medium focus:z-10 focus:outline-none focus:ring-4  border-gray-500 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white focus:ring-gray-600"
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
        {/* Add delete btn down here to be flex with add Book */}
      </div>
    </div>
  );
};

export const AddWishlistItem = () => {
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const ctx = api.useContext()

  const { mutate, isLoading } = api.wishlistItem.create.useMutation({
    onSuccess: () => {
      setShowModal(false)
      setTitle("")
      setAuthor("")
      setDescription("")
      void ctx.wishlistItem.getWishlistByUserId.invalidate();
    },
    onError: () => {
      toast.error("Error adding wishlist item")
    }
  })

  return (
    <div>
      <div className="flex justify-center">
        <button
          id="updateProductButton"
          data-modal-toggle="updateProductModal"
          className="rounded bg-violet-500 px-1 text-center text-lg font-medium text-slate-950 focus:outline-none focus:ring-4 focus:ring-violet-400"
          type="button"
          title="Add Wishlist Item"
          onClick={() => setShowModal(true)}
        >
          +
        </button>
      </div>

      <div
        id="updateProductModal"
        tabIndex={-1}
        aria-hidden="true"
        className={`h-modal fixed left-0 right-0 top-0 z-50 h-screen w-full items-center justify-center overflow-y-auto overflow-x-hidden py-12 md:inset-0 ${
          showModal ? "flex" : "hidden"
        } bg-black bg-opacity-60`}
      >
        <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
          <div className="relative rounded-lg bg-gray-800 p-4 shadow-lg sm:p-5">
            <div className="mb-4 flex items-center justify-between rounded-t border-b border-gray-600 pb-4 sm:mb-5">
              <h3 className="text-lg font-semibold text-white">
                Add Wishlist Item
              </h3>
              <button
                type="button"
                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm hover:bg-gray-600 hover:text-white"
                data-modal-toggle="updateProductModal"
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
            </div>

            <form>
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Book Title
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700  p-2.5 text-sm text-white placeholder-gray-400"
                    placeholder="Ex. Alchemist"
                  />
                </div>
                <div>
                  <label
                    htmlFor="brand"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Author
                  </label>
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className=" focus:ring-violet-500 focus:border-violet-500 block w-full rounded-lg border border-gray-600 bg-gray-700  p-2.5 text-sm text-white placeholder-gray-400"
                    placeholder="Ex. Paulo Coelho"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    maxLength={255}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="focus:ring-violet-500 focus:border-violet-500 block w-full rounded-lg border p-2.5 text-sm  border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Write a description..."
                  ></textarea>
                  <div className="text-xs font-light text-white pt-2">{description.length}/255</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    mutate({ 
                      title, 
                      author, 
                      description,
                      link: `https://amazon.com/s?k=${title}+${author}`
                     })
                  }}
                  type="submit"
                  className="rounded-lg bg-violet-400 px-5 py-2.5 text-center text-sm font-medium text-slate-950 hover:bg-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-300"
                >
                  {isLoading ? <LoadingSpinner /> : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
