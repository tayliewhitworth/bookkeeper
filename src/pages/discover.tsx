import { type NextPage } from "next";

import { LoadingSpinner } from "~/components/loading";
import Image from "next/image";

import { api } from "~/utils/api";

import { useState, useMemo } from "react";
import Link from "next/link";

import { useUser } from "@clerk/nextjs";

import { toast } from "react-hot-toast";

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

interface Book {
  title: string;
  author: string;
  description: string;
  bookCover: string;
}

const BookItem = (props: { book: Book }) => {
  const { isSignedIn } = useUser();
  const { book } = props

  const { mutate, isLoading, isSuccess, isError } =
    api.wishlistItem.create.useMutation();

  const addToWishlist = (book: {
    title: string;
    author: string;
    description: string;
  }) => {
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

  return (
    <div key={book.title} className="flex max-w-md items-center gap-3">
      <div>
        <Image
          src={book.bookCover}
          alt={book.title}
          width={100}
          height={150}
          className="h-[150px] min-w-[100px] rounded-md"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-bold text-slate-300">{book.title}</p>
        <p className="text-sm text-slate-400">By {book.author}</p>
        <p className="text-xs text-slate-600">
          {book.description.slice(0, 200)}
        </p>
        {isSignedIn && (
          <button
            title="Add to Wishlist"
            disabled={isLoading || isSuccess}
            onClick={() => addToWishlist(book)}
            className="rounded-md bg-violet-500 p-2 text-sm"
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
    </div>
  );
};

const BookSearch = () => {
  const [data, setData] = useState<
    {
      title: string;
      author: string;
      description: string;
      bookCover: string;
    }[]
  >();
  const [searchTerm, setSearchTerm] = useState("");


  const handleBookSearch = async (): Promise<void> => {
    try {
      const encodedQuery = encodeURIComponent(searchTerm);

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${encodedQuery}&maxResults=10&orderBy=newest`
      );
      const data = (await response.json()) as DataResponseBody;

      if (data.items.length > 0) {
        const books = data.items.map((book) => {
          const fetchedTitle = book.volumeInfo.title
            ? book?.volumeInfo.title
            : "Unkonwn Title";
          const fetchedAuthor = book.volumeInfo.authors
            ? book?.volumeInfo.authors[0]
            : "Unknown Author";

          const fetchedBookCover = book.volumeInfo.imageLinks
            ? book.volumeInfo.imageLinks.thumbnail
            : "https://placehold.co/200?text=Book+Cover&font=roboto";

          return {
            title: fetchedTitle,
            author: fetchedAuthor ?? "Unknown Author",
            description:
              book.volumeInfo.description ?? "No description available",
            bookCover:
              fetchedBookCover ??
              "https://placehold.co/200?text=Book+Cover&font=roboto",
          };
        });
        setData(books);
        setSearchTerm("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4">
        <form
          onSubmit={(e): void => {
            e.preventDefault();
            void handleBookSearch();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Search for books by genre"
            value={searchTerm}
            className="w-full max-w-sm rounded-md border-2 border-gray-600 bg-gray-600 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="rounded-md bg-slate-950 p-2 text-sm">
            Search
          </button>
        </form>
      </div>
      <div className="m-auto grid place-content-center gap-5 p-5">
        {data?.map((book) => (
          <BookItem key={book.title} book={book} />
        ))}
      </div>
    </div>
  );
};

const ReaderSearch = () => {
  const { data } = api.profile.getAllUsers.useQuery();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.users.filter((user) => {
      if (searchTerm.trim() === "") {
        return true;
      }

      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const userProfile = data.profiles.find(
        (profile) => profile.userId === user.id
      );
      const profileTags = userProfile?.tags.toLowerCase().split(",") ?? [];

      return (
        (user.username &&
          user.username.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (user.externalUsername &&
          user.externalUsername.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (user.name && user.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        profileTags.some((tag) => tag.includes(lowerCaseSearchTerm))
      );
    });
  }, [data, searchTerm]);

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <input
          type="text"
          placeholder="Search Readers or Genres"
          value={searchTerm}
          className="w-full max-w-sm rounded-md border-2 border-gray-600 bg-gray-600 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-300"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="m-auto grid place-content-center gap-4 p-5">
        {filteredData.length > 0 ? (
          filteredData.map((user) => (
            <div key={user.id} className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Link href={`/@${user.externalUsername ?? user.name}`}>
                  <div className="overflow-hidden rounded-full transition-shadow hover:shadow-md hover:shadow-violet-300">
                    <Image
                      src={user.profileImageUrl}
                      alt={user.name}
                      width={50}
                      height={50}
                      className="h-[50px] w-[50px] object-cover"
                    />
                  </div>
                </Link>
                <div className="transition-colors hover:text-violet-400">
                  <Link href={`/@${user.externalUsername ?? user.name}`}>
                    <p>@{user.externalUsername ?? user.name}</p>
                  </Link>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {data?.profiles
                  .find((profile) => profile.userId === user.id)
                  ?.tags.split(",")
                  .map((tag) => (
                    <div
                      key={tag}
                      className="cursor-pointer rounded-xl bg-slate-950 py-1 pl-2 pr-1"
                    >
                      <p>{tag}</p>
                    </div>
                  )) ?? ""}
              </div>
            </div>
          ))
        ) : (
          <div>No Matches</div>
        )}
      </div>
    </>
  );
};

const Discover: NextPage = () => {
  const [showSearch, setShowSearch] = useState(false);
  const { data, isLoading } = api.profile.getAllUsers.useQuery();

  if (isLoading)
    return (
      <div className="mt-4 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      <main className="min-h-screen flex-col items-center">
        <div className="flex flex-col items-center justify-center p-4">
          <h1 className="p-4 text-center text-4xl font-bold text-violet-300">
            Discover
          </h1>
          <div className="flex flex-col gap-2 text-center text-sm">
            <p>Search By:</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(false)}
                className={`${
                  showSearch ? "bg-slate-950" : "bg-violet-500"
                } rounded-xl p-2`}
              >
                Readers
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className={` ${
                  showSearch ? "bg-violet-500" : "bg-slate-950"
                } rounded-xl p-2`}
              >
                Genre
              </button>
            </div>
          </div>
        </div>
        {!showSearch ? <ReaderSearch /> : <BookSearch />}
        {/* <Feed /> */}
      </main>
    </>
  );
};

export default Discover;
