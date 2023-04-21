import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

import { useState } from "react";

const AddBook: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Add Book</title>
      </Head>
      <main className="min-h-screen flex-col items-center p-4">
        <div>
          {/* <img
            className="rounded-full"
            src={user.profileImageUrl}
            width={30}
            height={30}
          />
          <p>
            {user.firstName} {user.lastName}
          </p> */}
          <section className="bg-slate-950 max-w-xl m-auto p-1 rounded-lg">
            <div className="mx-auto max-w-2xl px-4 py-8 lg:py-16">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Add a new book to your collection!
              </h2>
              <form>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Book Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="Type Book Title"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="author"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      id="author"
                      className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="Book Author"
                      required
                    />
                  </div>
                  
                  <div>
                    <label
                      htmlFor="genre"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Genre
                    </label>

                    <input
                      type="text"
                      name="genre"
                      id="genre"
                      className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="Book Genre"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="started"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Date Started
                    </label>
                    <input
                      type="date"
                      name="started"
                      id="started"
                      className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="img-link"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Image Link
                    </label>
                    <input
                      type="text"
                      name="img-link"
                      id="img-link"
                      className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="https://placehold.co/600?text=Book+Cover&font=roboto"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={8}
                      className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="Your description here"
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-violet-400 focus:ring-violet-500 hover:bg-violet-600 mt-4 inline-flex items-center rounded-lg px-5 py-2.5 text-center text-sm font-medium text-slate-200 focus:ring-4 sm:mt-6"
                >
                  Add Book
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AddBook;
