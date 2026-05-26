module.exports = {
  apps: [
    {
      name: 'saas-backend',
      script: './backend/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      max_memory_restart: '500M',
    },
    {
      name: 'saas-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      max_memory_restart: '500M',
    },
    {
      name: 'caddy',
      script: './caddy/run-caddy.sh',
      watch: ['./caddy/Caddyfile'],
      error_file: './logs/caddy-error.log',
      out_file: './logs/caddy-out.log',
    },
  ],
};
