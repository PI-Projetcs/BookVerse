describe('bookService rating workflows (mock mode - RF08)', () => {
  let bookService;

  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_USE_MOCK = 'true';
    bookService = require('../services/bookService');
  });

  describe('rateBook', () => {
    it('creates a rating for a book with valid input', async () => {
      const result = await bookService.rateBook(1, 4, 'Great book!');

      expect(result).toBeTruthy();
      expect(result.item).toBeTruthy();
      expect(result.item.bookId).toBe(1);
      expect(result.item.rating).toBe(4);
      expect(result.item.review).toBe('Great book!');
    });

    it('validates rating must be between 1 and 5', async () => {
      try {
        await bookService.rateBook(1, 0);
        fail('Should reject rating below 1');
      } catch (error) {
        expect(error.message).toContain('inválida');
      }

      try {
        await bookService.rateBook(1, 6);
        fail('Should reject rating above 5');
      } catch (error) {
        expect(error.message).toContain('inválida');
      }
    });

    it('requires rating to be an integer', async () => {
      try {
        await bookService.rateBook(1, 3.5);
        fail('Should reject non-integer rating');
      } catch (error) {
        expect(error.message).toContain('inválida');
      }
    });

    it('allows optional review text', async () => {
      const resultWithReview = await bookService.rateBook(1, 5, 'Amazing!');
      expect(resultWithReview.item.review).toBe('Amazing!');

      const resultWithoutReview = await bookService.rateBook(2, 4);
      expect(resultWithoutReview.item.review).toBe('');
    });

    it('returns normalized rating with required fields', async () => {
      const result = await bookService.rateBook(3, 3, 'It was okay');

      expect(result.item).toHaveProperty('id');
      expect(result.item).toHaveProperty('bookId');
      expect(result.item).toHaveProperty('rating');
      expect(result.item).toHaveProperty('review');
      expect(result.item).toHaveProperty('createdAt');
    });
  });

  describe('getBookRatings', () => {
    it('returns empty array when no ratings exist for book', async () => {
      const result = await bookService.getBookRatings(999);

      expect(result).toBeTruthy();
      expect(result.items).toEqual([]);
    });

    it('returns ratings after a book has been rated', async () => {
      // Create a rating
      const rating = await bookService.rateBook(5, 5, 'Excellent!');
      
      // Retrieve ratings for that book
      const result = await bookService.getBookRatings(5);

      expect(result.items).toEqual(expect.any(Array));
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('returns normalized rating objects with all fields', async () => {
      await bookService.rateBook(7, 4, 'Good book');
      const result = await bookService.getBookRatings(7);

      if (result.items.length > 0) {
        const rating = result.items[0];
        expect(rating).toHaveProperty('id');
        expect(rating).toHaveProperty('bookId');
        expect(rating).toHaveProperty('rating');
        expect(rating).toHaveProperty('review');
      }
    });
  });

  describe('updateBookRating', () => {
    it('updates an existing book rating', async () => {
      // Create initial rating
      await bookService.rateBook(8, 3, 'Not great');

      // Update it
      const updated = await bookService.updateBookRating(8, 5, 'Actually, it was great!');

      expect(updated.item.rating).toBe(5);
      expect(updated.item.review).toBe('Actually, it was great!');
    });

    it('validates updated rating values', async () => {
      await bookService.rateBook(9, 3);

      try {
        await bookService.updateBookRating(9, 0);
        fail('Should reject invalid rating');
      } catch (error) {
        expect(error.message).toContain('inválida');
      }
    });

    it('can change just the rating without review', async () => {
      await bookService.rateBook(10, 2, 'Original review');
      
      const updated = await bookService.updateBookRating(10, 4);

      expect(updated.item.rating).toBe(4);
    });

    it('can change just the review without rating', async () => {
      const original = await bookService.rateBook(11, 3, 'Initial review');
      
      const updated = await bookService.updateBookRating(11, 3, 'Updated review');

      expect(updated.item.rating).toBe(3);
      expect(updated.item.review).toBe('Updated review');
    });

    it('returns updated rating with proper normalization', async () => {
      await bookService.rateBook(12, 2);
      const result = await bookService.updateBookRating(12, 4, 'Much better!');

      expect(result.item).toHaveProperty('id');
      expect(result.item).toHaveProperty('bookId');
      expect(result.item.rating).toBe(4);
      expect(result.item.review).toBe('Much better!');
      expect(result.item).toHaveProperty('updatedAt');
    });
  });

  describe('deleteBookRating', () => {
    it('removes a book rating', async () => {
      // Create a rating
      await bookService.rateBook(13, 5, 'Great!');

      // Delete it
      const result = await bookService.deleteBookRating(13);

      expect(result.success).toBe(true);

      // Verify it's gone
      const ratings = await bookService.getBookRatings(13);
      expect(ratings.items).toEqual([]);
    });

    it('handles deletion of non-existent ratings gracefully', async () => {
      const result = await bookService.deleteBookRating(999);

      expect(result.success).toBe(true);
    });
  });

  describe('book rating workflow integration (RF08)', () => {
    it('supports full rating lifecycle for books', async () => {
      const bookId = 100;

      // User rates a book
      const initial = await bookService.rateBook(bookId, 4, 'Really enjoyed this');
      expect(initial.item.rating).toBe(4);
      expect(initial.item.review).toContain('enjoyed');

      // User retrieves their rating
      const retrieved = await bookService.getBookRatings(bookId);
      expect(retrieved.items.length).toBeGreaterThan(0);

      // User updates their rating
      const updated = await bookService.updateBookRating(bookId, 5, 'Even better on second reading!');
      expect(updated.item.rating).toBe(5);
      expect(updated.item.review).toContain('second reading');

      // User can delete their rating if desired
      const deleted = await bookService.deleteBookRating(bookId);
      expect(deleted.success).toBe(true);

      // Verify deletion
      const final = await bookService.getBookRatings(bookId);
      expect(final.items).toEqual([]);
    });

    it('maintains separate ratings for different books', async () => {
      // Rate book 1
      const rating1 = await bookService.rateBook(201, 5, 'Excellent');

      // Rate book 2
      const rating2 = await bookService.rateBook(202, 3, 'Good');

      // Verify independent storage
      expect(rating1.item.bookId).toBe(201);
      expect(rating2.item.bookId).toBe(202);
      expect(rating1.item.rating).toBe(5);
      expect(rating2.item.rating).toBe(3);
    });

    it('allows users to rate books while browsing catalog', async () => {
      // User views book details
      const book = await bookService.getBookById(1);
      expect(book).toBeTruthy();

      // User rates the book
      const rating = await bookService.rateBook(book.id, 4, 'Great read');
      expect(rating.item.bookId).toBe(book.id);

      // User can view their rating
      const ratings = await bookService.getBookRatings(book.id);
      expect(ratings.items.length).toBeGreaterThan(0);
    });

    it('allows updating rating without affecting book details', async () => {
      const bookId = 300;
      const book = await bookService.getBookById(bookId);

      // Rate the book
      await bookService.rateBook(bookId, 3, 'Initial rating');

      // Update the rating
      await bookService.updateBookRating(bookId, 4, 'Improved opinion');

      // Book details remain unchanged
      const bookAfter = await bookService.getBookById(bookId);
      expect(bookAfter).toEqual(book);
    });
  });
});
