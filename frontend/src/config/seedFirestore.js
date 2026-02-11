import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function seedBooks() {
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 1200,
      description: "Classic Jazz Age novel about the mysterious millionaire Jay Gatsby.",
      cover_image: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
      stock: 20,
      category: "Fiction",
      rating: 4.5
    },
    {
      title: "1984",
      author: "George Orwell",
      price: 1100,
      description: "Dystopian novel about surveillance and total control.",
      cover_image: "https://covers.openlibrary.org/b/id/12624314-L.jpg",
      stock: 25,
      category: "Science Fiction",
      rating: 4.7
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      price: 999,
      description: "Romantic novel about Elizabeth Bennet and Mr. Darcy.",
      cover_image: "https://covers.openlibrary.org/b/id/12645114-L.jpg",
      stock: 18,
      category: "Romance",
      rating: 4.6
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      price: 1500,
      description: "Fantasy adventure about Bilbo Baggins and the One Ring.",
      cover_image: "https://covers.openlibrary.org/b/id/6979861-L.jpg",
      stock: 30,
      category: "Fantasy",
      rating: 4.8
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      price: 1300,
      description: "Novel about racial injustice in the American Deep South.",
      cover_image: "https://covers.openlibrary.org/b/id/8226191-L.jpg",
      stock: 15,
      category: "Fiction",
      rating: 4.8
    },
    {
      title: "The Alchemist",
      author: "Paulo Coelho",
      price: 950,
      description: "Philosophical novel about following your dreams.",
      cover_image: "https://covers.openlibrary.org/b/id/8231991-L.jpg",
      stock: 28,
      category: "Philosophy",
      rating: 4.6
    },
    {
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      price: 1400,
      description: "First book in the magical Harry Potter series.",
      cover_image: "https://covers.openlibrary.org/b/id/7888781-L.jpg",
      stock: 40,
      category: "Fantasy",
      rating: 4.9
    },
    {
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      price: 2000,
      description: "Epic fantasy trilogy about the One Ring.",
      cover_image: "https://covers.openlibrary.org/b/id/6979867-L.jpg",
      stock: 35,
      category: "Fantasy",
      rating: 4.9
    },
    {
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      price: 1600,
      description: "Psychological novel about guilt and redemption.",
      cover_image: "https://covers.openlibrary.org/b/id/8231999-L.jpg",
      stock: 10,
      category: "Classic",
      rating: 4.7
    },
    {
      title: "War and Peace",
      author: "Leo Tolstoy",
      price: 2200,
      description: "Historical novel set during the Napoleonic Wars.",
      cover_image: "https://covers.openlibrary.org/b/id/8232001-L.jpg",
      stock: 8,
      category: "History",
      rating: 4.6
    },
    {
      title: "The Da Vinci Code",
      author: "Dan Brown",
      price: 1250,
      description: "Thriller about secret societies and hidden codes.",
      cover_image: "https://covers.openlibrary.org/b/id/8240449-L.jpg",
      stock: 27,
      category: "Thriller",
      rating: 4.3
    },
    {
      title: "The Kite Runner",
      author: "Khaled Hosseini",
      price: 1350,
      description: "Story of friendship and redemption in Afghanistan.",
      cover_image: "https://covers.openlibrary.org/b/id/8260195-L.jpg",
      stock: 19,
      category: "Drama",
      rating: 4.6
    },
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      price: 1700,
      description: "Exploration of cosmology and the universe.",
      cover_image: "https://covers.openlibrary.org/b/id/8260288-L.jpg",
      stock: 14,
      category: "Science",
      rating: 4.5
    },
    {
      title: "The Shining",
      author: "Stephen King",
      price: 1200,
      description: "Horror novel set in a haunted hotel.",
      cover_image: "https://covers.openlibrary.org/b/id/8220422-L.jpg",
      stock: 16,
      category: "Horror",
      rating: 4.4
    },
    {
      title: "The Hunger Games",
      author: "Suzanne Collins",
      price: 1100,
      description: "Dystopian novel about survival and rebellion.",
      cover_image: "https://covers.openlibrary.org/b/id/8231859-L.jpg",
      stock: 24,
      category: "Science Fiction",
      rating: 4.6
    },
    {
      title: "The Fault in Our Stars",
      author: "John Green",
      price: 950,
      description: "Romantic drama about two teenagers with cancer.",
      cover_image: "https://covers.openlibrary.org/b/id/8259449-L.jpg",
      stock: 21,
      category: "Romance",
      rating: 4.5
    },
    {
      title: "The Chronicles of Narnia",
      author: "C.S. Lewis",
      price: 1500,
      description: "Fantasy series set in the magical land of Narnia.",
      cover_image: "https://covers.openlibrary.org/b/id/8232015-L.jpg",
      stock: 26,
      category: "Fantasy",
      rating: 4.7
    },
    {
      title: "Moby Dick",
      author: "Herman Melville",
      price: 1450,
      description: "Epic tale of obsession and revenge at sea.",
      cover_image: "https://covers.openlibrary.org/b/id/8232017-L.jpg",
      stock: 9,
      category: "Classic",
      rating: 4.3
    },
    {
      title: "Frankenstein",
      author: "Mary Shelley",
      price: 1000,
      description: "Gothic novel about a scientist and his creation.",
      cover_image: "https://covers.openlibrary.org/b/id/8232019-L.jpg",
      stock: 13,
      category: "Horror",
      rating: 4.4
    },
    {
      title: "Dracula",
      author: "Bram Stoker",
      price: 1050,
      description: "Classic vampire novel of horror and suspense.",
      cover_image: "https://covers.openlibrary.org/b/id/8232021-L.jpg",
      stock: 11,
      category: "Horror",
      rating: 4.3
    },
    {
      title: "The Girl with the Dragon Tattoo",
      author: "Stieg Larsson",
      price: 1250,
      description: "Thriller about mystery and investigation.",
      cover_image: "https://covers.openlibrary.org/b/id/8242728-L.jpg",
      stock: 17,
      category: "Thriller",
      rating: 4.5
    },
    {
      title: "Brave New World",
      author: "Aldous Huxley",
      price: 1150,
      description: "Dystopian novel exploring a futuristic society.",
      cover_image: "https://covers.openlibrary.org/b/id/8775116-L.jpg",
      stock: 20,
      category: "Science Fiction",
      rating: 4.4
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      price: 1050,
      description: "Story of teenage angst and alienation.",
      cover_image: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
      stock: 12,
      category: "Fiction",
      rating: 4.2
    },
    {
      title: "The Odyssey",
      author: "Homer",
      price: 1380,
      description: "Ancient Greek epic about Odysseus's journey home.",
      cover_image: "https://covers.openlibrary.org/b/id/12645116-L.jpg",
      stock: 7,
      category: "Classic",
      rating: 4.5
    },
    {
      title: "Gone Girl",
      author: "Gillian Flynn",
      price: 1200,
      description: "Psychological thriller about a marriage gone wrong.",
      cover_image: "https://covers.openlibrary.org/b/id/8259299-L.jpg",
      stock: 22,
      category: "Thriller",
      rating: 4.2
    },
    {
      title: "The Divine Comedy",
      author: "Dante Alighieri",
      price: 1750,
      description: "Epic poem through Hell, Purgatory, and Paradise.",
      cover_image: "https://covers.openlibrary.org/b/id/12624308-L.jpg",
      stock: 5,
      category: "Classic",
      rating: 4.6
    },
    {
      title: "The Picture of Dorian Gray",
      author: "Oscar Wilde",
      price: 1080,
      description: "Novel about beauty, corruption, and vanity.",
      cover_image: "https://covers.openlibrary.org/b/id/8231953-L.jpg",
      stock: 14,
      category: "Classic",
      rating: 4.4
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      price: 1600,
      description: "Epic science fiction on the desert planet Arrakis.",
      cover_image: "https://covers.openlibrary.org/b/id/12726811-L.jpg",
      stock: 22,
      category: "Science Fiction",
      rating: 4.6
    },
    {
      title: "The Bell Jar",
      author: "Sylvia Plath",
      price: 980,
      description: "Novel about mental health and identity.",
      cover_image: "https://covers.openlibrary.org/b/id/12645119-L.jpg",
      stock: 11,
      category: "Drama",
      rating: 4.3
    },
    {
      title: "Animal Farm",
      author: "George Orwell",
      price: 890,
      description: "Political allegory about power and corruption.",
      cover_image: "https://covers.openlibrary.org/b/id/12624316-L.jpg",
      stock: 23,
      category: "Fiction",
      rating: 4.5
    }
  ];

  for (const book of books) {
    await addDoc(collection(db, "books"), book);
  }
  console.log("✅ Seeded books into Firestore!");
}
