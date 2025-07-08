# VAH Care Backend API

A production-ready Node.js backend for the VAH Care healthcare recruitment platform.

## Features

- ✅ **Contact Form API** - Handles contact form submissions with email notifications
- ✅ **Job Application API** - Manages job applications with CV file uploads
- ✅ **Security** - Helmet, CORS, Rate limiting, Input validation
- ✅ **File Upload** - Multer for CV uploads with validation
- ✅ **Email Integration** - Nodemailer for SMTP email sending
- ✅ **Database** - MongoDB with Mongoose ODM
- ✅ **Error Handling** - Comprehensive error handling middleware
- ✅ **Logging** - Morgan for request logging
- ✅ **Compression** - Gzip compression for responses
- ✅ **Production Ready** - PM2 configuration for cluster deployment

## API Endpoints

### POST /api/contact
Submit a contact form
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "service": "home_care",
  "message": "I'm interested in your services"
}
```

### POST /api/jobs/apply
Submit a job application (multipart/form-data)
```
Fields:
- jobId: string (required)
- fullName: string (required)
- email: string (required)
- experience: string (required)
- availability: string (required)
- message: string (optional)
- cv: file (PDF/DOC/DOCX, max 5MB)
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update all environment variables with your values

4. **Create required directories**
   ```bash
   mkdir -p uploads logs
   ```

## Development

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run API tests
node test-api.js
```

## Production Deployment

### Option 1: PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2 cluster mode
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs
```

### Option 2: Docker
```bash
# Build image
docker build -t vahcare-backend .

# Run container
docker run -d -p 5000:5000 --env-file .env vahcare-backend
```

### Option 3: Manual
```bash
# Set environment
export NODE_ENV=production

# Start server
npm start
```

## Environment Variables

### Required
- `MONGO_URI` - MongoDB connection string
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `ADMIN_EMAIL` - Admin email for notifications

### Optional
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `BASE_URL` - Base URL for file downloads

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Form Rate Limiting**: 5 form submissions per 15 minutes per IP
- **Input Validation**: All inputs validated and sanitized
- **File Upload Security**: File type and size validation
- **CORS Configuration**: Configured for production domains
- **Helmet**: Security headers enabled
- **Error Handling**: No sensitive data exposed in errors

## Monitoring

- **Logs**: All requests logged with Morgan
- **Error Logs**: Errors logged to `logs/error.log`
- **Access Logs**: Requests logged to `logs/access.log`
- **Health Check**: Server status available at root endpoint

## Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `multer` - File upload handling
- `nodemailer` - Email sending
- `helmet` - Security headers
- `cors` - CORS handling
- `morgan` - Request logging
- `compression` - Response compression
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables

### Development
- `nodemon` - Development server with auto-reload

## Testing

The API includes a test script that validates:
- Contact form submission
- Email validation
- 404 error handling
- Rate limiting
- File upload validation

Run tests with:
```bash
node test-api.js
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify `MONGO_URI` in `.env`
   - Check MongoDB Atlas IP whitelist
   - Ensure database user has correct permissions

2. **Email Not Sending**
   - Verify SMTP credentials in `.env`
   - Check Gmail app password settings
   - Verify recipient email addresses

3. **File Upload Errors**
   - Check `uploads/` directory exists
   - Verify file type and size limits
   - Check disk space availability

4. **Rate Limiting Issues**
   - Adjust limits in `middleware/rateLimiter.js`
   - Consider using Redis for distributed rate limiting

### Performance Optimization

- Use PM2 cluster mode for multi-core utilization
- Enable MongoDB connection pooling
- Configure reverse proxy (nginx) for static files
- Use Redis for session storage in production
- Implement database indexing for queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

Private - All rights reserved
