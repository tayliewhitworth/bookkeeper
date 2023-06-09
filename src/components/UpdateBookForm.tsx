/* eslint-disable @typescript-eslint/no-misused-promises */

import { api } from "~/utils/api";

import DeleteBtn from "~/components/DeleteBtn";

import { useState } from "react";

import { LoadingSpinner } from "~/components/loading";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { genreOptions } from "~/pages/add-book";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { toast } from "react-hot-toast";

type Inputs = {
  title: string;
  author: string;
  genre: string;
  description: string;
  dateStarted: string;
  dateFinished: string;
  rating: number;
};

const UpdateBook = (props: { id: string }) => {
  const { data } = api.books.getById.useQuery({ id: props.id });

  const [showInfo, setShowInfo] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const updateBook = api.books.update.useMutation();
  const ctx = api.useContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  if (!data) return <div>Something went wrong...</div>;

  const onSubmit: SubmitHandler<Inputs> = async (
    formData,
    event
  ): Promise<void> => {
    event?.preventDefault();
    try {
      await updateBook
        .mutateAsync({
          id: data?.book.id,
          title: formData.title,
          author: formData.author,
          description: formData.description,
          genre: formData.genre,
          dateStarted: new Date(formData.dateStarted).toISOString(),
          dateFinished: new Date(formData.dateFinished).toISOString(),
          rating: Number(formData.rating),
        })
        .then(() => {
          setShowModal(false);
          void ctx.books.infinteFeed.invalidate();
          void ctx.books.getById.invalidate();
        });
    } catch (error) {
      toast.error("Something went wrong...");
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-center">
          <button
            type="button"
            className="rounded bg-violet-400 px-2 py-1 text-sm font-medium text-slate-950 transition-colors hover:bg-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-400"
            title="Edit Book"
            onClick={() => setShowModal(true)}
          >
            Edit
          </button>
        </div>

        <div
          aria-hidden="true"
          className={`h-modal fixed left-0 right-0 top-0 z-50 h-screen w-full items-center justify-center overflow-y-auto overflow-x-hidden py-12 md:inset-0 ${
            showModal ? "flex" : "hidden"
          } bg-black bg-opacity-60`}
        >
          <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
            <section className="m-auto max-w-xl rounded-lg bg-gray-800 p-1">
              <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="mb-4 flex items-center justify-between rounded-t border-b border-gray-600 pb-4 sm:mb-5">
                  <h3 className="text-lg font-bold text-white">Editors Note</h3>
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
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="title"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        Book Title
                      </label>
                      <input
                        defaultValue={data.book.title}
                        {...register("title", { required: true })}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      />
                      {errors.title && <span>This field is required</span>}
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="author"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        Author
                      </label>
                      <input
                        defaultValue={data.book.author}
                        {...register("author", { required: true })}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      />
                      {errors.author && <span>This field is required</span>}
                    </div>

                    <div>
                      <label
                        htmlFor="genre"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        Genre
                      </label>
                      <select
                        defaultValue={data.book.genre}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                        {...register("genre", { required: true })}
                      >
                        <option value={data.book.genre}>
                          {data.book.genre}
                        </option>
                        {genreOptions.map((genre) => (
                          <option key={genre} value={genre}>
                            {genre}
                          </option>
                        ))}
                      </select>
                      {errors.genre && <span>This field is required</span>}
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="started"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        {`Date Started: ${dayjs(data.book.dateStarted).format(
                          "MM/DD/YYYY"
                        )}`}
                      </label>
                      <input
                        type="datetime-local"
                        defaultValue={dayjs(data.book.dateStarted).format(
                          "YYYY-MM-DDTHH:mm"
                        )}
                        {...register("dateStarted")}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="finished"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        {`Date Finished: ${dayjs(data.book.dateFinished).format(
                          "MM/DD/YYYY"
                        )}`}
                      </label>

                      <input
                        type="datetime-local"
                        defaultValue={dayjs(data.book.dateFinished).format(
                          "YYYY-MM-DDTHH:mm"
                        )}
                        {...register("dateFinished")}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="w-fit">
                      <label
                        htmlFor="rating"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        Rating out of 5
                      </label>

                      <input
                        type="number"
                        max={5}
                        min={0}
                        step={0.5}
                        defaultValue={data.book.rating}
                        {...register("rating")}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
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
                        defaultValue={data.book.description}
                        maxLength={255}
                        rows={5}
                        {...register("description", { required: true })}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      />
                      {errors.description && (
                        <span>This field is required</span>
                      )}
                      <div className="pt-2 text-xs">
                        {data.book.description.length}/255
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="flex items-center text-sm text-gray-400">
                      Where is my book cover?{" "}
                      <button
                        data-popover-target="popover-description"
                        data-popover-placement="bottom-end"
                        type="button"
                        title="Generate Image Info"
                        onClick={() => setShowInfo(!showInfo)}
                      >
                        <svg
                          className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span className="sr-only">Show information</span>
                      </button>
                    </p>
                    <div
                      data-popover
                      id="popover-description"
                      role="tooltip"
                      className={`pb-5 absolute z-10 inline-block w-72 rounded-lg border border-gray-600 bg-gray-800 text-sm text-gray-400 shadow-sm transition-opacity duration-300 ${
                        showInfo ? "visible opacity-100" : "invisible opacity-0"
                      }`}
                    >
                      <div className="space-y-2 p-3">
                        <h3 className="font-semibold text-white">
                          Generate Image Cover
                        </h3>
                        <p>
                          Have you ever heard the phrase, &quot;Don&apos;t judge
                          a book by its cover&quot;?
                        </p>
                        <h3 className="font-semibold text-white">
                          Well, that is our philosophy!
                        </h3>
                        <p>
                          We currently use the Google Books API to generate a
                          cover image for your book. We are working on a feature
                          to allow you to upload your own image in the future.
                          Stay tuned! But for now, we are unable to update the
                          image cover.
                        </p>
                      </div>
                      <div data-popper-arrow></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      type="submit"
                      className="mt-4 inline-flex items-center rounded-lg bg-violet-400 px-5 py-2.5 text-center text-sm font-medium text-slate-200 hover:bg-violet-600 focus:ring-4 focus:ring-violet-500 sm:mt-6"
                    >
                      {updateBook.isLoading ? (
                        <LoadingSpinner />
                      ) : updateBook.isSuccess ? (
                        "Updated!"
                      ) : (
                        "Update Book"
                      )}
                    </button>

                    <div className="mt-4 inline-flex items-center sm:mt-6">
                      <DeleteBtn id={data.book.id} />
                    </div>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateBook;
