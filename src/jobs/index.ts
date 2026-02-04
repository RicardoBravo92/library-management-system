import eventEmitter from '../utils/events.js';
import { authorBookCountJob } from './authorBookCount.job.js';

export const setupEventListeners = () => {
  eventEmitter.on('book.changed', (authorId: number) => {
    authorBookCountJob(authorId);
  });
};

