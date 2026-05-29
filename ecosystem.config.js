module.exports = {
  apps: [
    {
      name: 'saas-backend',
      script: './backend/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      error_file: '/home/ubuntu/.pm2/logs/saas-backend-error.log',
      out_file: '/home/ubuntu/.pm2/logs/saas-backend-out.log',
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
      error_file: '/home/ubuntu/.pm2/logs/saas-frontend-error.log',
      out_file: '/home/ubuntu/.pm2/logs/saas-frontend-out.log',
      max_memory_restart: '500M',
    },
  ],
};
