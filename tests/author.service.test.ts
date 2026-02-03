import { jest } from '@jest/globals';

// 1. Definir el mock antes de importar el servicio
jest.unstable_mockModule('../src/config/prisma.js', () => ({
  __esModule: true,
  default: {
    author: {
      findUnique: jest.fn(),
    },
  },
}));

// 2. Importar dinámicamente el servicio y el mock para que usen la versión mockeada
const { getAuthorDetail } = await import('../src/services/author.service.js');
const { default: prisma } = await import('../src/config/prisma.js');
const { AppError } = await import('../src/utils/AppError.js');

describe('AuthorService.getAuthorDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw AppError if id is NaN', async () => {
    await expect(getAuthorDetail(NaN)).rejects.toThrow(AppError);
  });

  it('should throw AppError if author not found', async () => {
    (prisma.author.findUnique as any).mockResolvedValue(null);
    await expect(getAuthorDetail(1)).rejects.toThrow('Author not found');
  });

  it('should return author if found', async () => {
    const mockAuthor = { id: 1, name: 'Test Author', books: [] };
    (prisma.author.findUnique as any).mockResolvedValue(mockAuthor);
    
    const result = await getAuthorDetail(1);
    expect(result).toEqual(mockAuthor);
  });
});
