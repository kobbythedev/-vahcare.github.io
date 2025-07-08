module.exports = {
  apps: [
    {
      name: 'vahcare-backend',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/access.log',
      log_file: './logs/combined.log',
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: [
        'node_modules',
        'uploads',
        'logs'
      ]
    }
  ]
};
