import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Image from "next/image";
import type { StaticImageData } from "next/image";

import placeholder from "../assets/placeholder.svg";
import { LoadingSpinner } from "~/components/loading";

const placeholderImage = placeholder as StaticImageData;

interface BookCoverResponseBody {
  items: {
    volumeInfo: {
      imageLinks?: {
        thumbnail?: string | null;
      };
    };
  }[];
}
const AddBook: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [dateStarted, setDateStarted] = useState("");
  const [dateFinished, setDateFinished] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | StaticImageData | null | undefined>(placeholderImage);

  const ctx = api.useContext()

  const mutation = api.books.create.useMutation({
    onSuccess: () => {
      router.push('/')
      void ctx.books.getAll.invalidate()
    },
    onError: (error) => {
      const errorMessage = error?.data?.zodError?.fieldErrors;
      console.log(errorMessage);
    },
  });

  if (!user) return null;


  const generateImage = async (): Promise<void> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${title}`
      );
      const data = (await response.json()) as BookCoverResponseBody;
      const bookCover: string | null | undefined =
        data.items[0]?.volumeInfo?.imageLinks?.thumbnail;
      setCoverImage(bookCover);
    } catch (err) {
      console.log(err);
    }
  };

  const canSave =
    [title, author, genre, dateStarted, description].every(Boolean) &&
    !mutation.isLoading;

  const handleSubmit = () => {
    const imgSrc = typeof coverImage === "string" ? coverImage : coverImage?.src;
    mutation.mutate({
      title,
      author,
      genre,
      dateStarted: new Date(dateStarted).toISOString(),
      dateFinished: new Date(dateFinished).toISOString(),
      description,
      imgSrc: imgSrc !== undefined ? imgSrc : "",
    })
  };


  return (
    <>
      <Head>
        <title>Add Book</title>
      </Head>
      <main className="min-h-screen flex-col items-center p-4">
        <div>
          <section className="m-auto max-w-xl rounded-lg bg-slate-950 p-1">
            <div className="mx-auto max-w-2xl px-4 py-8 lg:py-16">
              <h2 className="mb-4 text-xl font-bold text-white">
                Add a new book to your collection!
              </h2>
              <form>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Book Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      placeholder="Type Book Title"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="author"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      placeholder="Book Author"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="genre"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Genre
                    </label>

                    <input
                      type="text"
                      name="genre"
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      placeholder="Book Genre"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="started"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Date Started
                    </label>
                    <input
                      type="datetime-local"
                      name="started"
                      id="started"
                      value={dateStarted}
                      onChange={(e) => setDateStarted(e.target.value)}
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="finished"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Date Finished
                    </label>
                    <input
                      type="datetime-local"
                      name="finished"
                      id="finished"
                      value={dateFinished}
                      onChange={(e) => setDateFinished(e.target.value)}
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex flex-wrap items-center justify-around gap-3 py-4">
                      <button
                        onClick={(): void => void generateImage()}
                        type="button"
                        className="inline-flex items-center rounded-lg bg-violet-600 px-5 py-2.5 text-center text-sm font-medium text-slate-200 hover:bg-violet-500 focus:ring-4 focus:ring-violet-500"
                      >
                        Generate Image Cover
                      </button>
                      {coverImage && (
                        <Image
                          width={80}
                          height={80}
                          src={coverImage}
                          alt="Book Cover"
                          className="aspect-auto h-auto rounded shadow shadow-white"
                        />
                      )}
                    </div>
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
                      rows={8}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      placeholder="Your description here"
                    ></textarea>
                  </div>
                </div>
                
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!canSave}
                  className="mt-4 inline-flex items-center rounded-lg bg-violet-400 px-5 py-2.5 text-center text-sm font-medium text-slate-200 hover:bg-violet-600 focus:ring-4 focus:ring-violet-500 sm:mt-6"
                >
                  Add Book
                </button>
                {mutation.isLoading && (
                  <div>
                    <LoadingSpinner />
                  </div>
                )}
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AddBook;
