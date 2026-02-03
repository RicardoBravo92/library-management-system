import { jest } from '@jest/globals';

// 1. Mock de Prisma y EventEmitter antes de importar el servicio
jest.unstable_mockModule('../src/config/prisma.js', () => ({
  __esModule: true,
  default: {
    author: {
      findUnique: jest.fn(),
    },
    book: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('../src/utils/events.js', () => ({
  __esModule: true,
  default: {
    emit: jest.fn(),
  },
}));

// 2. Importaciones dinámicas
const { createNewBook, getBookDetail } = await import('../src/services/book.service.js');
const { default: prisma } = await import('../src/config/prisma.js');
const { default: eventEmitter } = await import('../src/utils/events.js');
const { AppError } = await import('../src/utils/AppError.js');

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewBook', () => {
    it('should throw AppError if author does not exist', async () => {
      (prisma.author.findUnique as any).mockResolvedValue(null);

      await expect(
        createNewBook({ title: 'Test Book', authorId: 999 })
      ).rejects.toThrow('Author not found');
      
      expect(prisma.author.findUnique).toHaveBeenCalled();
      expect(prisma.book.create).not.toHaveBeenCalled();
    });

    it('should create a book and emit event if author exists', async () => {
      const mockAuthor = { id: 1, name: 'Author' };
      const mockBook = { id: 10, title: 'Test Book', authorId: 1 };
      
      (prisma.author.findUnique as any).mockResolvedValue(mockAuthor);
      (prisma.book.create as any).mockResolvedValue(mockBook);

      const result = await createNewBook({ title: 'Test Book', authorId: 1 });

      expect(result).toEqual(mockBook);
      expect(prisma.book.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('book.changed', 1);
    });
  });

  describe('getBookDetail', () => {
    it('should throw AppError if book not found', async () => {
      (prisma.book.findUnique as any).mockResolvedValue(null);

      await expect(getBookDetail(1)).rejects.toThrow('Book not found');
    });

    it('should return book if found', async () => {
      const mockBook = { id: 1, title: 'Find Me', author: { name: 'Author' } };
      (prisma.book.findUnique as any).mockResolvedValue(mockBook);

      const result = await getBookDetail(1);
      expect(result).toEqual(mockBook);
    });
  });
});
