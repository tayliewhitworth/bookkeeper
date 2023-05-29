import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { StaticImageData } from "next/image";

import { toast } from "react-hot-toast";

import placeholder from "../assets/placeholder.svg";
import { LoadingSpinner } from "~/components/loading";

const placeholderImage = placeholder as StaticImageData;


interface DataResponseBody {
  items: {
    volumeInfo: {
      title?: string | null;
      authors?: string[] | null;
      categories?: string[] | null;
      description?: string | null;
      imageLinks?: {
        thumbnail?: string | null;
      };
    };
  }[];
}

export const genreOptions = [
  "Action🏃",
  "Romance💓",
  "Comedy😂",
  "Business🤔",
  "Self-Improvement👍",
  "Fantasy🧙",
  "Sci-Fi🚀",
  "Horror👻",
  "Thriller😎",
  "Mystery🔍",
  "Historical👵",
  "Non-Fiction😏",
  "Fiction📖",
  "Biography🤩",
];

const AddBook: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();

  const [showInfo, setShowInfo] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [dateStarted, setDateStarted] = useState("");
  const [dateFinished, setDateFinished] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<
    string | StaticImageData | null | undefined
  >(placeholderImage);
  const [rating, setRating] = useState(0);

  const ctx = api.useContext();
  const { mutate, isLoading } = api.books.create.useMutation({
    onSuccess: () => {
      void ctx.books.infinteFeed.invalidate();
      void ctx.books.getAll.invalidate();
      router.push("/");
    },
    onError: (err) => {
      const errorMessage = err?.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong, please try again later");
      }
    },
  });

  if (!user) return null;


  const handleBookSearch = async (): Promise<void> => {
    try {
      const encodedTitle = encodeURIComponent(title);

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodedTitle}`
      );
      const data = (await response.json()) as DataResponseBody;

      if (data.items.length > 0) {
        const book = data.items[0]?.volumeInfo;
        if (!book) throw new Error("No book found.");
        const fetchedAuthor = book.authors ? book.authors[0] : "N/A";
        const fetchedGenre = book.categories ? book.categories[0] : "N/A";
        const fetchedBookCover = book.imageLinks
          ? book.imageLinks.thumbnail
          : data.items[1]?.volumeInfo?.imageLinks?.thumbnail ?? placeholderImage;
        const fetchedDescription = (book.description || "N/A").substring(
          0,
          255
        );
        setAuthor(fetchedAuthor ?? "");
        setGenre(fetchedGenre ?? "");
        setDescription(fetchedDescription);
        setCoverImage(fetchedBookCover);
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  const canSave =
    [title, author, genre, dateStarted, description].every(Boolean) &&
    !isLoading;

  const imgSrc = typeof coverImage === "string" ? coverImage : coverImage?.src;

  return (
    <>
      <Head>
        <title>Add Book</title>
      </Head>
      <main className="min-h-screen flex-col items-center p-4">
        <div>
          <section className="m-auto max-w-xl rounded-lg bg-slate-950 p-1">
            <div className="mx-auto max-w-2xl px-4 py-8">
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
                    <div className="flex items-center gap-3">
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
                      <button
                        className="inline-flex items-center rounded-lg bg-violet-600 p-2.5 text-center text-sm font-medium text-slate-200 hover:bg-violet-500 focus:ring-4 focus:ring-violet-500 min-w-fit"
                        type="button"
                        onClick={(): void => void handleBookSearch()}
                      >
                        Search Book
                      </button>
                    </div>
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
                    <select
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      required
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                    >
                      <option value={genre}>{genre}</option>
                      {genreOptions.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
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
                    <div className="pb-4">

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
                    <div>
                      <p className="flex items-center text-sm text-gray-400">
                        What is this?{" "}
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
                        className={`absolute z-10 inline-block w-72 rounded-lg border border-gray-600 bg-gray-800 text-sm text-gray-400 shadow-sm transition-opacity duration-300 ${
                          showInfo
                            ? "visible opacity-100"
                            : "invisible opacity-0"
                        }`}
                      >
                        <div className="space-y-2 p-3">
                          <h3 className="font-semibold text-white">
                            Generate Image Cover
                          </h3>
                          <p>
                            Have you ever heard the phrase, &quot;Don&apos;t
                            judge a book by its cover&quot;?
                          </p>
                          <h3 className="font-semibold text-white">
                            Well, that is our philosophy!
                          </h3>
                          <p>
                            Just enter in the title of the book and press Search Book!
                            We currently use the Google Books API to generate a
                            cover image for your book. We are working on a
                            feature to allow you to upload your own image in the
                            future. Stay tuned! But for now, enjoy the original
                            cover image!
                          </p>
                        </div>
                        <div data-popper-arrow></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="steps-range"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Rating out of 5
                    </label>
                    <input
                      id="steps-range"
                      type="range"
                      min="0"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value))}
                      step="0.5"
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
                    />
                    <ul className="flex items-center justify-between text-xs text-gray-500">
                      <li>0</li>
                      <li>0.5</li>
                      <li>1</li>
                      <li>1.5</li>
                      <li>2</li>
                      <li>2.5</li>
                      <li>3</li>
                      <li>3.5</li>
                      <li>4</li>
                      <li>4.5</li>
                      <li>5</li>
                    </ul>
                    <p className="pt-2 text-sm">{rating} out of 5</p>
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
                      maxLength={255}
                      onChange={(e) => setDescription(e.target.value)}
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400"
                      placeholder="Your description here"
                    ></textarea>
                    <div className="pt-2 text-xs">{description.length}/255</div>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    mutate({
                      title,
                      author,
                      genre,
                      dateStarted: new Date(dateStarted).toISOString(),
                      dateFinished: new Date(dateFinished).toISOString(),
                      description,
                      imgSrc: imgSrc !== undefined ? imgSrc : "",
                      rating,
                    });
                  }}
                  disabled={!canSave}
                  className="mt-4 inline-flex items-center rounded-lg bg-violet-400 px-5 py-2.5 text-center text-sm font-medium text-slate-200 hover:bg-violet-600 focus:ring-4 focus:ring-violet-500 sm:mt-6"
                >
                  Add Book
                </button>
                {isLoading && (
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
