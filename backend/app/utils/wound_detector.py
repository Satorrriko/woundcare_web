# backend/app/utils/wound_detector.py
import cv2
import numpy as np
from PIL import Image
import io
import os
import matplotlib.pyplot as plt
class ReferenceMarkerDetector:
    def __init__(self):
        # HSV范围：绿色标记
        self.lower_green = np.array([30, 20, 20])  # HSV绿色的低阈值
        self.upper_green = np.array([90, 255, 255])  # HSV绿色的高阈值
        
        # 创建结果保存目录
        self.results_dir = 'detection_results'
        if not os.path.exists(self.results_dir):
            os.makedirs(self.results_dir)
    def detect_from_bytes(self, image_bytes):
        """从字节数据中检测绿色圆形标记"""
        # 将字节转换为图像
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return self.detect(img, debug=False)
    
    def detect(self, img, debug=False):
        """检测图像中的绿色圆形标记"""
        # 创建调试图像集合
        debug_images = {}
        debug_images['original'] = img.copy()
        
        # 转换到HSV色彩空间
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        debug_images['hsv'] = hsv.copy()
        
        # 创建绿色掩码
        green_mask = cv2.inRange(hsv, self.lower_green, self.upper_green)
        debug_images['green_mask'] = green_mask.copy()
        
        # 形态学操作以去除噪声
        kernel = np.ones((10,10), np.uint8)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel)
        debug_images['morphology'] = green_mask.copy()
        
        # 找到轮廓
        contours, _ = cv2.findContours(green_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            if debug:
                self._save_debug_images(debug_images)
            return None
            
        # 找到最圆的轮廓
        best_contour = None
        best_circularity = 0
        best_metrics = {}
        
        contour_img = img.copy()
        cv2.drawContours(contour_img, contours, -1, (0, 255, 0), 2)
        debug_images['all_contours'] = contour_img
        
        for contour in contours:
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            
            if perimeter == 0:
                continue
            
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            
            if circularity > best_circularity:
                best_circularity = circularity
                best_contour = contour
                best_metrics = {
                    'area': area,
                    'perimeter': perimeter,
                    'circularity': circularity
                }
        
        if best_contour is None or best_circularity < 0.8:
            if debug:
                self._save_debug_images(debug_images)
            return None
        
        # 绘制最佳轮廓
        result_img = img.copy()
        cv2.drawContours(result_img, [best_contour], -1, (0, 255, 0), 2)
        
        # 拟合椭圆或圆形
        if len(best_contour) >= 5:
            (x, y), (MA, ma), angle = cv2.fitEllipse(best_contour)
            cv2.ellipse(result_img, ((x,y), (MA,ma), angle), (255, 0, 0), 2)
            svg_path = self._create_ellipse_svg_path(x, y, MA/2, ma/2, angle)
        else:
            (x, y), radius = cv2.minEnclosingCircle(best_contour)
            center = (int(x), int(y))
            radius = int(radius)
            cv2.circle(result_img, center, radius, (255, 0, 0), 2)
            svg_path = self._create_circle_svg_path(x, y, radius)
        
        debug_images['result'] = result_img
        
        if debug:
            self._save_debug_images(debug_images, best_metrics)
        
        return {
            'svg_path': svg_path,
            'area': float(best_metrics['area']),
            'center': {'x': float(x), 'y': float(y)},
            'circularity': float(best_metrics['circularity']),
            'visualization_path': os.path.join(self.results_dir, 
                                               f'detection_process.png')
        }

    def _save_debug_images(self, images, metrics=None):
        """保存调试图像"""
        plt.figure(figsize=(20, 10))
        print("original")
        # 原始图像
        plt.subplot(231)
        plt.imshow(cv2.cvtColor(images['original'], cv2.COLOR_BGR2RGB))
        plt.title('Original Image')
        plt.axis('off')
        print("hsv")
        # HSV图像
        plt.subplot(232)
        plt.imshow(images['hsv'])
        plt.title('HSV Image')
        plt.axis('off')
        print("mask")
        # 绿色掩码
        plt.subplot(233)
        plt.imshow(images['green_mask'], cmap='gray')
        plt.title('Green Mask')
        plt.axis('off')
        
        # 形态学处理后
        plt.subplot(234)
        plt.imshow(images['morphology'], cmap='gray')
        plt.title('After Morphology')
        plt.axis('off')
        
        # 所有轮廓
        plt.subplot(235)
        plt.imshow(cv2.cvtColor(images['all_contours'], cv2.COLOR_BGR2RGB))
        plt.title('All Contours')
        plt.axis('off')
        
        # 最终结果
        if 'result' in images:
            plt.subplot(236)
            plt.imshow(cv2.cvtColor(images['result'], cv2.COLOR_BGR2RGB))
            title = 'Final Result\n'
            if metrics:
                title += f'Circularity: {metrics["circularity"]:.3f}\n'
                title += f'Area: {metrics["area"]:.0f}'
            plt.title(title)
            plt.axis('off')
        
        plt.tight_layout()
        
        # 保存图像
        filename = os.path.join(self.results_dir, 
                              f'detection_process.png')
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close()

    
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
