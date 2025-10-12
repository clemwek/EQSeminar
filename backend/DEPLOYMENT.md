# Production Deployment Guide

## Prerequisites

1. **PostgreSQL Database**: Set up a managed PostgreSQL instance (AWS RDS, DigitalOcean, etc.)
2. **S3 Bucket**: Create an S3 bucket for file uploads
3. **AWS Credentials**: IAM user with S3 access
4. **Docker**: Installed on your production server

## Step 1: Configure Environment Variables

Copy the production environment template:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your actual values:

```env
DATABASE_URL=postgresql://user:password@your-db-host:5432/attendance
ADMIN_TOKEN=generate-a-strong-random-token
S3_BUCKET=your-s3-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

**Generate a secure admin token:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 2: Build and Deploy with Docker

### Option A: Docker Compose (Single Server)

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Build and start the service
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Option B: Manual Docker Build

```bash
# Build the image
cd backend
docker build -f Dockerfile.prod -t seminar-attendance-api:latest .

# Run the container
docker run -d \
  --name seminar-api \
  -p 4000:4000 \
  --env-file ../.env.production \
  --restart unless-stopped \
  seminar-attendance-api:latest
```

## Step 3: Verify Deployment

Test the health endpoint:

```bash
curl http://your-server:4000/health
```

Expected response:
```json
{"ok": true}
```

## Step 4: Configure Reverse Proxy (Recommended)

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # For file uploads
        client_max_body_size 50M;
    }
}
```

Enable SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

## Step 5: Database Setup

The application will automatically run migrations on startup. To manually run migrations:

```bash
# Inside the container
docker exec -it seminar-api python run_migrations.py
```

## S3 Bucket Configuration

1. **Create S3 bucket** in your AWS account
2. **Set bucket policy** to allow your IAM user to upload files:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-IAM-USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. **Enable CORS** for your bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Monitoring and Maintenance

### View Logs
```bash
docker logs -f seminar-api
```

### Restart Service
```bash
docker restart seminar-api
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
pg_dump -h your-db-host -U your-user -d attendance > backup.sql
```

## Security Checklist

- [ ] Use HTTPS with SSL certificate
- [ ] Set a strong `ADMIN_TOKEN`
- [ ] Restrict database access to your server's IP
- [ ] Configure firewall rules (only allow ports 80, 443, 22)
- [ ] Keep Docker images updated
- [ ] Enable database backups
- [ ] Secure S3 bucket with proper IAM policies
- [ ] Set up monitoring and alerts

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection from container
docker exec -it seminar-api python -c "from app.db import db; from app import create_app; app = create_app(); app.app_context().push(); print(db.engine.url)"
```

### File Upload Issues
- Verify S3 credentials are correct
- Check bucket permissions
- Ensure CORS is configured

### Migration Issues
```bash
# Manually run migrations
docker exec -it seminar-api python run_migrations.py
```

## Scaling

For high traffic, consider:

1. **Increase Gunicorn workers** in `Dockerfile.prod`:
   ```dockerfile
   CMD ["gunicorn", "-w", "8", "-b", "0.0.0.0:4000", "wsgi:app"]
   ```

2. **Use a load balancer** with multiple instances
3. **Enable database connection pooling**
4. **Use Redis for caching** (future enhancement)

## Cost Optimization

- Use AWS RDS free tier for small deployments
- S3 Standard-IA for infrequent file access
- CloudFront CDN for file delivery
- Auto-scaling groups for variable traffic
