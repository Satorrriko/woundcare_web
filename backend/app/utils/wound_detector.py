# backend/app/utils/wound_detector.py
import cv2
import numpy as np
from PIL import Image
import io

class ReferenceMarkerDetector:
    def __init__(self):
        # HSV范围：绿色标记
        self.lower_green = np.array([40, 40, 40])  # HSV绿色的低阈值
        self.upper_green = np.array([80, 255, 255])  # HSV绿色的高阈值
        
    def detect_from_bytes(self, image_bytes):
        """从字节数据中检测绿色圆形标记"""
        # 将字节转换为图像
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return self.detect(img)
    
    def detect(self, img):
        """检测图像中的绿色圆形标记"""
        # 转换到HSV色彩空间
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # 创建绿色掩码
        green_mask = cv2.inRange(hsv, self.lower_green, self.upper_green)
        
        # 形态学操作以去除噪声
        kernel = np.ones((5,5), np.uint8)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel)
        
        # 找到轮廓
        contours, _ = cv2.findContours(green_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
            
        # 找到最圆的轮廓
        best_contour = None
        best_circularity = 0
        
        for contour in contours:
            # 计算轮廓面积和周长
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            
            if perimeter == 0:
                continue
                
            # 计算圆度（circularity）
            # 完美的圆形circularity = 1
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            
            if circularity > best_circularity:
                best_circularity = circularity
                best_contour = contour
        
        if best_contour is None or best_circularity < 0.8:  # 圆度阈值
            return None
        
        # 计算结果
        area = cv2.contourArea(best_contour)
        
        # 获取椭圆拟合参数
        if len(best_contour) >= 5:  # 至少需要5个点来拟合椭圆
            (x, y), (MA, ma), angle = cv2.fitEllipse(best_contour)
            
            # 创建SVG椭圆路径
            svg_path = self._create_ellipse_svg_path(x, y, MA/2, ma/2, angle)
        else:
            # 如果点太少，使用圆形近似
            (x, y), radius = cv2.minEnclosingCircle(best_contour)
            svg_path = self._create_circle_svg_path(x, y, radius)
        
        return {
            'svg_path': svg_path,
            'area': float(area),
            'center': {'x': float(x), 'y': float(y)},
            'circularity': float(best_circularity),
        }
    
    def _create_ellipse_svg_path(self, cx, cy, rx, ry, angle_degrees):
        """创建SVG椭圆路径"""
        # SVG椭圆命令
        svg = f"M {cx-rx},{cy} "
        svg += f"A {rx},{ry} {angle_degrees} 1,0 {cx+rx},{cy} "
        svg += f"A {rx},{ry} {angle_degrees} 1,0 {cx-rx},{cy}"
        return svg
    
    def _create_circle_svg_path(self, cx, cy, r):
        """创建SVG圆形路径"""
        svg = f"M {cx-r},{cy} "
        svg += f"A {r},{r} 0 1,0 {cx+r},{cy} "
        svg += f"A {r},{r} 0 1,0 {cx-r},{cy}"
        return svg
        
    def create_svg_string(self, result, image_width, image_height):
        """创建完整的SVG字符串"""
        if not result:
            return None
            
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="{image_width}" height="{image_height}">
    <path d="{result['svg_path']}" 
          fill="none" 
          stroke="#00FF00"  
          stroke-width="2"
          stroke-dasharray="5,5"/>
</svg>"""
        return svg