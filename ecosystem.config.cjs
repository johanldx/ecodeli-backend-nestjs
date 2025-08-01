module.exports = {
  apps: [
    {
      name: 'ecodeli-backend-nestjs',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2/error.log',
      out_file: './logs/pm2/out.log',
      log_file: './logs/pm2/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
    },
  ],
}; 