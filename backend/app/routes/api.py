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
    """get the list of patients"""
    try:
        s3_helper = S3Helper(Config)
        contents = s3_helper.list_objects()
        
        # get all patient IDs
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
    """get the data for a specific patient"""
    try:
        s3_helper = S3Helper(Config)
        contents = s3_helper.list_objects()
        
        # process the file data
        all_patient_data = s3_helper.process_file_data(contents)
        
        # get the data for the specific patient
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
        
    # get the image size
    image = Image.open(io.BytesIO(image_bytes))
    width, height = image.size
    print(width, height)
    # detect the marker
    result = marker_detector.detect_from_bytes(image_bytes)
    print(result)
    
    if not result:
        print('No marker detected')
        return jsonify({'success': False, 'error': 'No marker detected'})
    
    # return the result
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
    # return the image from detect_results/detection_process.png
    image_url = 'detection_results/detection_process.png'
    base64_image = base64.b64encode(open(image_url, 'rb').read()).decode('utf-8')
    image = f'<img src="data:image/png;base64,{base64_image}">'
    return image
