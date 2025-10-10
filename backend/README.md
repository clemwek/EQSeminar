# Seminar Attendance Management System - Backend

A Flask + PostgreSQL REST API for managing seminars, talks, members, and attendance tracking.

## Tech Stack

- **Language/Framework**: Python 3.12 + Flask
- **Database**: PostgreSQL (Docker container)
- **ORM**: SQLAlchemy + Flask-Migrate
- **Validation**: Marshmallow
- **File Handling**: pandas, openpyxl for CSV/XLSX, boto3 for S3

## Features

- Seminar management with multi-day support
- Talk management with presentation file uploads (.pdf, .ppt, .pptx)
- Member management with CSV/XLSX bulk import
- Attendance tracking with duplicate prevention
- Comments on talks
- Attendance export to Excel
- Admin authentication via token
- Local file storage (dev) or S3 storage (prod)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Marshmallow validation schemas
│   ├── db.py                # Database setup
│   ├── middleware.py        # Admin auth middleware
│   ├── routes/
│   │   ├── seminars.py      # Seminar endpoints
│   │   ├── members.py       # Member endpoints
│   │   ├── talks.py         # Talk endpoints
│   │   └── attendance.py    # Attendance endpoints
│   └── utils/
│       ├── csv_import.py    # CSV/XLSX parsing
│       └── file_upload.py   # File upload (local/S3)
├── migrations/              # Database migrations
├── uploads/                 # Local file storage (dev)
├── Dockerfile
├── requirements.txt
├── .env
└── wsgi.py                  # Entry point
```

## Quick Start (Docker)

1. **Copy environment file**:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Start services**:
   ```bash
   docker compose up --build
   ```

   The API will be available at `http://localhost:4000`

## Local Development

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   ```

3. **Run migrations**:
   ```bash
   export FLASK_APP=wsgi.py
   flask db init  # Only on first setup
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

4. **Start server**:
   ```bash
   python wsgi.py
   ```

## API Endpoints

### Health Check
- `GET /health` - Returns `{ "ok": true }`

### Seminars
- `GET /api/seminars` - List all seminars
- `GET /api/seminars/:id` - Get seminar details
- `POST /api/seminars` (admin) - Create seminar
- `PATCH /api/seminars/:id` (admin) - Update seminar
- `GET /api/seminars/:id/register` - Get registered members
- `POST /api/seminars/:id/register` (admin) - Register member

### Talks
- `POST /api/talks` (admin) - Create talk (with file upload)
- `PATCH /api/talks/:id` (admin) - Update talk (with file upload)
- `GET /api/talks/:id/comments` - Get talk comments
- `POST /api/talks/:id/comments` - Add comment to talk

### Members
- `GET /api/members` - List all members
- `POST /api/members` (admin) - Create member
- `POST /api/members/import` (admin) - Import members from CSV/XLSX

### Attendance
- `POST /api/attendance/sign-in` - Sign in for attendance
- `GET /api/attendance/export` (admin) - Export attendance to Excel

## Authentication

Admin endpoints require the `x-admin-token` header:

```bash
curl -H "x-admin-token: change-me" http://localhost:4000/api/seminars
```

Set `ADMIN_TOKEN` in `.env` file.

## File Uploads

### Development
Files are stored locally in `backend/uploads/`

### Production
Configure S3 in `.env`:
```
S3_BUCKET=my-seminar-files
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
FLASK_ENV=production
```

## Data Models

### Seminar
- `id`, `title`, `description`, `number_of_days`, `status`, `created_at`, `updated_at`

### Talk
- `id`, `title`, `description`, `day`, `speaker`, `presentation_url`, `time_slot`, `seminar_id`

### Member
- `id`, `first_name`, `last_name`, `pf_number` (unique), `department`, `phone_number`

### Attendance
- `id`, `seminar_id`, `day`, `member_id`, `created_at`, `ip_address`, `location`
- Constraint: unique per member per day

### Comment
- `id`, `content`, `created_at`, `talk_id`, `member_id`, `comment_id` (for replies)

## Validation Rules

- **PF Number**: 4-12 digits
- **Phone Number**: 7-15 digits
- **Presentation Files**: .pdf, .ppt, .pptx only
- **Attendance**: One sign-in per member per day (409 on duplicate)

## CSV Import Format

For member imports, use CSV/XLSX with these columns:

```csv
firstName,lastName,pfNumber,department,phoneNumber
John,Doe,123456,Engineering,1234567890
Jane,Smith,789012,HR,9876543210
```

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/attendance
ADMIN_TOKEN=change-me
FLASK_ENV=development
PORT=4000

# S3 configuration (prod only)
S3_BUCKET=my-seminar-files
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## Testing Examples

### Create a Seminar
```bash
curl -X POST http://localhost:4000/api/seminars \
  -H "Content-Type: application/json" \
  -H "x-admin-token: change-me" \
  -d '{
    "title": "Python Workshop",
    "numberOfDays": 3,
    "status": "active"
  }'
```

### Create a Talk with File Upload
```bash
curl -X POST http://localhost:4000/api/talks \
  -H "x-admin-token: change-me" \
  -F "title=Introduction to Flask" \
  -F "day=1" \
  -F "speaker=John Doe" \
  -F "seminarId=1" \
  -F "file=@presentation.pdf"
```

### Sign-in for Attendance
```bash
curl -X POST http://localhost:4000/api/attendance/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "pfNumber": "123456",
    "dayId": 1,
    "seminarId": 1
  }'
```

### Import Members from CSV
```bash
curl -X POST http://localhost:4000/api/members/import \
  -H "x-admin-token: change-me" \
  -F "file=@members.csv"
```

### Export Attendance
```bash
curl -X GET "http://localhost:4000/api/attendance/export?seminarId=1" \
  -H "x-admin-token: change-me" \
  -o attendance_report.xlsx
```

## License

MIT
