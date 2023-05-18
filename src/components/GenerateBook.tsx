import { useState } from "react";

type BookFormData = {
  title: string;
  author: string | null | undefined;
  genre: string | null | undefined;
  description: string | null | undefined;
  bookCover: string | null | undefined;
};

type BookSearchProps = {
  onBookDataChange: (bookData: BookFormData) => void;
};

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

export const GenerateBook = ({ onBookDataChange }: BookSearchProps) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [bookCover, setBookCover] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const encodedTitle = encodeURIComponent(title);

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodedTitle}`
      );
      const data = await response.json() as DataResponseBody;

      if (data.items.length > 0) {
        const book = data?.items[0]?.volumeInfo;
        if (!book) throw new Error("No book found.")
        const fetchedAuthor = book.authors ? book.authors[0] : "N/A";
        const fetchedGenre = book.categories ? book.categories[0] : "N/A";
        const fetchedBookCover = book.imageLinks
          ? book.imageLinks.thumbnail
          : "";
        const fetchedDescription = book.description ? book.description : "N/A";

        setAuthor(fetchedAuthor || "N/A");
        setGenre(fetchedGenre || "N/A");
        setBookCover(fetchedBookCover || "");
        setDescription(fetchedDescription);

        onBookDataChange({
          title,
          author: fetchedAuthor,
          genre: fetchedGenre,
          bookCover: fetchedBookCover,
          description: fetchedDescription,
        });
      } else {
        console.log("No books found with that title.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
        <form onSubmit={void handleSubmit}>
            <label>Search for book by Title</label>
            <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
            />
            <button type="submit">Search</button>
        </form>
        <h2>Book Details:</h2>
        <div>
            <p>Author: {author}</p>
            <p>Genre: {genre}</p>
            <p>Description: {description}</p>
            <p>BOok COver: {bookCover}</p>
            
        </div>
    </div>
  )
};
