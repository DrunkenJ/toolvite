module.exports = {
  apps: [
    {
      name: 'toolvite-site',
      script: 'server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3400,
      },
      max_memory_restart: '150M',
    },
  ],
};
