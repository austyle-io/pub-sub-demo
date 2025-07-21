const config = { PORT: '3001', CLIENT_URL: 'http://localhost:3000' };
const PORT = config.PORT ?? 3001;
const origin = config.CLIENT_URL ?? 'http://localhost:3000';
console.log({ PORT, origin });
