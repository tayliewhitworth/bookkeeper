import { type NextPage } from "next";
import { LoadingSpinner } from "~/components/loading";
// import BookPosts from "~/components/BookPosts";
import { api } from "~/utils/api";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { InfiniteBookList } from "~/components/InfiniteBookList";

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

// const Feed = () => {
//   const { data } = api.books.getAll.useQuery();

//   return (
//     <div className="m-auto grid grid-cols-1 justify-items-center gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
//       {data?.map(({ book, user }) => (
//         <BookPosts key={book.id} book={book} user={user} />
//       ))}
//     </div>
//   );
// };

const Home: NextPage = () => {
  const { data, isLoading } = api.books.getAll.useQuery();
  const { isSignedIn } = useUser();

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
        <div className="flex items-center justify-between gap-5 p-5 max-w-sm m-auto md:max-w-2xl">
          <h1 className="text-3xl font-bold text-violet-300">Book Club</h1>
          <div className="rounded-lg bg-violet-500 p-2 text-sm font-medium text-slate-950 transition-colors hover:bg-violet-600">
            {isSignedIn ? (
              <Link href="/add-book">+ Add Book</Link>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
        <RecentBooks />
      </main>
    </>
  );
};

export default Home;
