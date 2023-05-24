import { type NextPage } from "next";
import { LoadingSpinner } from "~/components/loading";
import BookPosts from "~/components/BookPosts";
import { api } from "~/utils/api";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { InfiniteBookList } from "~/components/InfiniteBookList";
import { useState } from "react";

const RecentBooks = () => {
  const books = api.books.infinteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const allBooks = books.data?.pages.flatMap((page) => page.books);

  return (
    <InfiniteBookList
      books={allBooks}
      isError={books.isError}
      isLoading={books.isLoading}
      hasMore={books.hasNextPage}
      fetchNewBooks={books.fetchNextPage}
    />
  );
};

const Feed = () => {
  // const { data } = api.books.getAll.useQuery();
  const { user } = useUser();
  const { data, isLoading } = api.profile.getUserFollowing.useQuery({
    userId: user?.id ?? "",
  });

  if (isLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center text-center">
        Looks like you are not following anyone!🥲
      </div>
    );

  return (
    <div className="flex flex-col gap-4 py-4">
      {data.books.map(({ book, user }) => (
        <BookPosts key={book.id} book={book} user={user} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  // const { data, isLoading } = api.books.getAll.useQuery();
  const { isSignedIn } = useUser();
  const [showFollowing, setShowFollowing] = useState(false);
  const [showItems, setShowItems] = useState(false);

  // if (isLoading)
  //   return (
  //     <div className="mt-4 flex items-center justify-center">
  //       <LoadingSpinner />
  //     </div>
  //   );

  // if (!data) return <div>Something went wrong...</div>;

  function handleShowFollowing() {
    setShowFollowing((prev) => !prev);
    setShowItems(false);
  }

  return (
    <>
      <main className="min-h-screen flex-col items-center">
        <div className="m-auto flex max-w-sm items-center justify-between gap-5 p-5 md:max-w-2xl">
          <h1 className="text-3xl font-bold text-violet-300">Book Club</h1>
          <div>
            {isSignedIn ? (
              <div className="relative flex flex-col items-end text-sm font-medium text-slate-950">
                <button
                  onClick={() => setShowItems((prev) => !prev)}
                  className="font-semi-bold text-xl rounded-lg bg-violet-500 w-8 h-8 flex items-center justify-center transition-all hover:bg-violet-600"
                >
                  {showItems ? "-" : "+"}
                </button>
                <div
                  className={`absolute right-0 top-10 z-50 h-max min-w-max flex-col items-start gap-1 rounded-lg bg-violet-500 p-2 ${
                    showItems ? "flex" : "hidden"
                  }`}
                >
                  <Link
                    href="/add-book"
                    className=" w-full border-b border-slate-950 p-2 transition-all hover:rounded hover:bg-slate-950 hover:text-white"
                  >
                    Add Book
                  </Link>
                  <button
                    onClick={handleShowFollowing}
                    className=" w-full border-b border-slate-950 p-2 text-left transition-all hover:rounded hover:bg-slate-950 hover:text-white"
                  >
                    {showFollowing ? "Show All" : "Show Following"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-violet-500 p-2 text-sm font-medium text-slate-950 transition-colors hover:bg-violet-600">
                <SignInButton />
              </div>
            )}
          </div>
        </div>
        {showFollowing ? <Feed /> : <RecentBooks />}
      </main>
    </>
  );
};

export default Home;
