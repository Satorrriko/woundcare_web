from flask import Blueprint, jsonify, request
import io
from app.utils.s3_helper import S3Helper
from ..config import Config as Config
from app.utils.wound_detector import ReferenceMarkerDetector
from PIL import Image

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
    """检测绿色圆形标记并返回结果"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file'}), 400
            
        image_file = request.files['image']
        
        # 读取图片数据
        image_bytes = image_file.read()
        
        # 获取原始图片尺寸
        image = Image.open(io.BytesIO(image_bytes))
        width, height = image.size
        
        # 检测标记
        result = marker_detector.detect_from_bytes(image_bytes)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'No green circular marker detected'
            }), 400
            
        # 创建SVG
        svg_string = marker_detector.create_svg_string(result, width, height)
        
        # 返回结果
        return jsonify({
            'success': True,
            'result': {
                'svg_path': result['svg_path'],
                'area': result['area'],
                'center': result['center'],
                'circularity': result['circularity'],
            },
            'svg': svg_string
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500