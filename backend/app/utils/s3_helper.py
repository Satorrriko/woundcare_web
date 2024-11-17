# backend/app/utils/s3_helper.py
import boto3
from botocore.exceptions import ClientError
import os
class S3Helper:
    def __init__(self, config):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=config.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
            region_name=config.AWS_REGION
        )
        self.bucket = config.S3_BUCKET

    def list_objects(self):
        """列出存储桶中的所有对象"""
        try:
            response = self.s3_client.list_objects_v2(Bucket=self.bucket)
            return response.get('Contents', [])
        except ClientError as e:
            print(f"Error listing objects: {e}")
            return []

    def get_presigned_url(self, key, expires_in=300):
        """生成预签名URL"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': key
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return None

    def process_file_data(self, contents):
        """处理S3文件数据，组织成前端需要的格式"""
        patient_data = {}
        
        for file in contents:
            key = file['Key']
            # 跳过非图片文件
            if not (key.endswith('.jpg') or key.endswith('.svg')):
                continue

            # 解析文件名
            parts = key.replace('images/', '').split('_')
            if len(parts) < 6:
                continue

            patient_id = parts[0]
            case_id = parts[1]
            position = parts[2]
            date = parts[3]
            time = parts[4]
            area_part = parts[5]

            # 格式化日期和时间
            formatted_date = f"{date[:4]}-{date[4:6]}-{date[6:]}"
            formatted_time = f"{time[:2]}:{time[2:4]}:{time[4:]}"
            
            # 提取area值
            area = area_part.replace('.jpg', '').replace('.svg', '').replace('area', '')

            # 生成预签名URL
            url = self.get_presigned_url(key)
            if not url:
                continue

            # 组织数据结构
            if patient_id not in patient_data:
                patient_data[patient_id] = {'cases': {}}

            if case_id not in patient_data[patient_id]['cases']:
                patient_data[patient_id]['cases'][case_id] = {
                    'id': case_id,
                    'images': []
                }

            # 添加图片信息
            patient_data[patient_id]['cases'][case_id]['images'].append({
                'name': key.replace('images/', ''),
                'url': url,
                'position': position,
                'date': formatted_date,
                'time': formatted_time,
                'area': area
            })

        return patient_data