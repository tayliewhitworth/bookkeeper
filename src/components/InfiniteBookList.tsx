import type { BookData } from "~/server/helpers/bookType";
import { LoadingSpinner } from "./loading";
import InfiniteScroll from "react-infinite-scroll-component";
import BookPosts from "./BookPosts";

type InfiniteBookListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean | undefined;
  fetchNewBooks: () => Promise<unknown>;
  books?: BookData[];
};

export const InfiniteBookList = ({
  books,
  isError,
  isLoading,
  fetchNewBooks,
  hasMore = false,
}: InfiniteBookListProps) => {
  if (isLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  if (isError) return <div>Something went wrong...</div>;
  if (books == null || books.length === 0) return <div>No books found...</div>;

  return (
    <div>
      <InfiniteScroll
        dataLength={books.length}
        next={fetchNewBooks}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
        className="flex flex-col gap-4 py-4"
      >
        {books.map((book) => (
          <BookPosts key={book.book.id} {...book} />
        ))}
      </InfiniteScroll>
    </div>
  );
};
