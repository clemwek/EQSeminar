# Docker Setup Guide

This project includes Docker configurations for both development and production environments.

## Prerequisites

- Docker Desktop installed
- Docker Compose installed

## Development Environment

Run the application in development mode with hot-reload:

```bash
docker-compose up app-dev
```

The application will be available at `http://localhost:5173`

### Development Features
- Hot module replacement enabled
- Source code mounted as volume for live updates
- Node modules cached in container for faster builds

## Production Environment

Build and run the optimized production build:

```bash
docker-compose up app-prod
```

The application will be available at `http://localhost:8080`

### Production Features
- Multi-stage build for smaller image size
- Nginx server for optimal performance
- Gzip compression enabled
- Static asset caching configured

## Manual Docker Commands

### Development

Build the development image:
```bash
docker build -f Dockerfile.dev -t seminar-app-dev .
```

Run the development container:
```bash
docker run -p 5173:5173 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -v $(pwd):/app \
  -v /app/node_modules \
  seminar-app-dev
```

### Production

Build the production image:
```bash
docker build -t seminar-app-prod .
```

Run the production container:
```bash
docker run -p 8080:80 seminar-app-prod
```

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Stopping Containers

Stop running containers:
```bash
docker-compose down
```

Stop and remove volumes:
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If the port is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3000:5173"  # Change 5173 to your preferred port
```

### Permission Issues
On Linux, you may need to run Docker commands with `sudo` or add your user to the docker group:
```bash
sudo usermod -aG docker $USER
```

### Build Cache Issues
Clear Docker build cache:
```bash
docker builder prune
```
