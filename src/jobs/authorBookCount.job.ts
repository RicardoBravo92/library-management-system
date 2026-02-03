import { updateAuthorBookCount } from '../services/author.service.js';

export const authorBookCountJob = async (authorId: number) => {
  try {
    await updateAuthorBookCount(authorId);
  } catch (error) {
    console.error(`[Job] Error updating book count for author ${authorId}:`, error);
  }
};
