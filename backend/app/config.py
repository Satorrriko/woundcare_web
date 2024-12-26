# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # AWS config
    AWS_ACCESS_KEY_ID = 'AKIAQKGGXM7RYAIFTVDD'
    AWS_SECRET_ACCESS_KEY = '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'
    AWS_REGION = 'ap-southeast-2'
    S3_BUCKET = 'test12345464'
    
    # Flask config
    SECRET_KEY = 'dev'
    DEBUG = True