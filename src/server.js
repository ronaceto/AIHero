import { createApp } from './app.js';
import { getConfig } from './config.js';

const config = getConfig();
const server = createApp({ config });

server.listen(config.port, () => {
  console.log(`StudySidekickAI API listening on port ${config.port}`);
});
