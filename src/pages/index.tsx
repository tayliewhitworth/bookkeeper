import { type NextPage } from "next";
import { LoadingSpinner } from "~/components/loading";
import BookPosts from "~/components/BookPosts";
import { api } from "~/utils/api";


const Feed = () => {
  const { data } = api.books.getAll.useQuery();

  return (
    <div className="m-auto grid grid-cols-1 justify-items-center gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {data?.map(({ book, user }) => (
        <BookPosts key={book.id} book={book} user={user} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { data, isLoading } = api.books.getAll.useQuery();

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
        <div>
          <h1 className="text-center text-4xl font-bold text-violet-300">
            Book Club
          </h1>
        </div>
        <Feed />
      </main>
    </>
  );
};

export default Home;
