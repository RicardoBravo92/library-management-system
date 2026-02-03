import { env } from './config/env.js';
import app from './app.js';
import { setupEventListeners } from './jobs/index.js';

setupEventListeners();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
