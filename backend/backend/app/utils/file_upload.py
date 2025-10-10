import os
import boto3
from werkzeug.utils import secure_filename
from datetime import datetime

ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx'}
UPLOAD_FOLDER = 'uploads'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_file(file):
    if not file or not allowed_file(file.filename):
        raise ValueError('Invalid file type. Only .pdf, .ppt, and .pptx files are allowed.')

    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_filename = f"{timestamp}_{filename}"

    flask_env = os.getenv('FLASK_ENV', 'development')

    if flask_env == 'production' and os.getenv('S3_BUCKET'):
        return upload_to_s3(file, unique_filename)
    else:
        return upload_locally(file, unique_filename)

def upload_locally(file, filename):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    return f'/uploads/{filename}'

def upload_to_s3(file, filename):
    s3_bucket = os.getenv('S3_BUCKET')
    s3_region = os.getenv('S3_REGION', 'us-east-1')
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

    if not all([s3_bucket, aws_access_key, aws_secret_key]):
        raise ValueError('S3 configuration incomplete')

    s3_client = boto3.client(
        's3',
        region_name=s3_region,
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key
    )

    s3_key = f'presentations/{filename}'

    s3_client.upload_fileobj(
        file,
        s3_bucket,
        s3_key,
        ExtraArgs={'ContentType': file.content_type}
    )

    s3_url = f'https://{s3_bucket}.s3.{s3_region}.amazonaws.com/{s3_key}'
    return s3_url
