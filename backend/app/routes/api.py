from flask import Blueprint, jsonify, request
import io
from app.utils.s3_helper import S3Helper
from ..config import Config as Config
from app.utils.wound_detector import ReferenceMarkerDetector
from PIL import Image
import base64

api = Blueprint('api', __name__)
marker_detector = ReferenceMarkerDetector()

@api.route('/patients', methods=['GET'])
def get_patients():
    """获取所有患者列表"""
    try:
        s3_helper = S3Helper(Config)
        contents = s3_helper.list_objects()
        
        # 提取唯一的患者ID
        patient_ids = set()
        for file in contents:
            key = file['Key']
            if key.startswith('images/'):
                patient_id = key.split('_')[0].replace('images/', '')
                patient_ids.add(patient_id)
        
        return jsonify(list(patient_ids))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/patients/<patient_id>', methods=['GET'])
def get_patient_data(patient_id):
    """获取特定患者的所有数据"""
    try:
        s3_helper = S3Helper(Config)
        contents = s3_helper.list_objects()
        
        # 处理所有文件数据
        all_patient_data = s3_helper.process_file_data(contents)
        
        # 获取特定患者的数据
        patient_data = all_patient_data.get(patient_id, {'cases': {}})
        
        return jsonify(patient_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@api.route('/detect-marker', methods=['POST'])
def detect_marker():
 #   try:
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file'})
        
    image_file = request.files['image']
    image_bytes = image_file.read()
        
    # 获取原始图片尺寸
    image = Image.open(io.BytesIO(image_bytes))
    width, height = image.size
    print(width, height)
    # 检测创伤边缘
    result = marker_detector.detect_from_bytes(image_bytes)
    print(result)
    
    if not result:
        print('No marker detected')
        return jsonify({'success': False, 'error': 'No marker detected'})
    
    # 格式化返回数据，确保所有数值都是数字
    circle_data = {
        'success': True,
        'result': {
            'center': {
                'x': float(result['center']['x']),
                'y': float(result['center']['y'])
            },
            'radius': float(result['radius']) if 'radius' in result else 5.0,
            'area': float(result['area']),
            'svg_path': result['svg_path'],
            'circularity': float(result['circularity'])  
        }
    }
    print(circle_data)
    return jsonify(circle_data)
        
#    except Exception as e:
#        print(e)
#        print('Error api detect marker')
#        return jsonify({'success': False, 'error': str(e)})

import base64
@api.route('/view', methods=['GET'])
def view():
    # 返回detect_results/detection_process.png显示在网页上
    image_url = 'detection_results/detection_process.png'
    base64_image = base64.b64encode(open(image_url, 'rb').read()).decode('utf-8')
    image = f'<img src="data:image/png;base64,{base64_image}">'
    return image
