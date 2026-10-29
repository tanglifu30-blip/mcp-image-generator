#!/usr/bin/env python3
"""
图片质量分析工具 - 对比噪点和清晰度
"""
import sys
from PIL import Image
import numpy as np

def analyze_image_quality(image_path):
    """
    分析图片质量指标

    返回:
    - noise_level: 噪点水平（标准差，越低越好）
    - sharpness: 清晰度（梯度强度，越高越好）
    - color_variance: 色彩方差
    """
    img = Image.open(image_path)
    img_array = np.array(img)

    # 转换为灰度以分析噪点
    if len(img_array.shape) == 3:
        gray = np.mean(img_array, axis=2)
    else:
        gray = img_array

    # 噪点水平：使用局部标准差
    # 计算相邻像素的差异
    diff_horizontal = np.diff(gray, axis=1)
    diff_vertical = np.diff(gray, axis=0)

    noise_level = np.std(diff_horizontal) + np.std(diff_vertical)

    # 清晰度：使用梯度强度
    gradient_x = np.gradient(gray, axis=1)
    gradient_y = np.gradient(gray, axis=0)
    gradient_magnitude = np.sqrt(gradient_x**2 + gradient_y**2)
    sharpness = np.mean(gradient_magnitude)

    # 色彩方差
    if len(img_array.shape) == 3:
        color_variance = np.mean([np.var(img_array[:,:,i]) for i in range(3)])
    else:
        color_variance = np.var(gray)

    return {
        'noise_level': float(noise_level),
        'sharpness': float(sharpness),
        'color_variance': float(color_variance),
        'resolution': f"{img.size[0]}x{img.size[1]}"
    }

def compare_images(image_paths, models):
    """对比多张图片的质量"""
    print("=" * 80)
    print("图片质量对比分析")
    print("=" * 80)
    print()

    results = []
    for path, model in zip(image_paths, models):
        try:
            metrics = analyze_image_quality(path)
            results.append({
                'model': model,
                'path': path,
                **metrics
            })

            print(f"模型: {model}")
            print(f"文件: {path.split('\\\\')[-1]}")
            print(f"  噪点水平: {metrics['noise_level']:.2f} (越低越好)")
            print(f"  清晰度:   {metrics['sharpness']:.2f} (越高越好)")
            print(f"  色彩方差: {metrics['color_variance']:.2f}")
            print(f"  分辨率:   {metrics['resolution']}")
            print()
        except Exception as e:
            print(f"❌ {model}: 无法分析 - {e}")
            print()

    # 排名
    if results:
        print("=" * 80)
        print("综合评分（噪点权重 60%，清晰度权重 40%）")
        print("=" * 80)
        print()

        # 归一化分数
        noise_levels = [r['noise_level'] for r in results]
        sharpness_levels = [r['sharpness'] for r in results]

        min_noise = min(noise_levels)
        max_noise = max(noise_levels)
        min_sharp = min(sharpness_levels)
        max_sharp = max(sharpness_levels)

        for r in results:
            # 噪点：越低越好，归一化到 0-100
            noise_score = 100 - ((r['noise_level'] - min_noise) / (max_noise - min_noise + 0.001) * 100)

            # 清晰度：越高越好，归一化到 0-100
            sharp_score = ((r['sharpness'] - min_sharp) / (max_sharp - min_sharp + 0.001) * 100)

            # 综合评分
            total_score = noise_score * 0.6 + sharp_score * 0.4

            r['noise_score'] = noise_score
            r['sharp_score'] = sharp_score
            r['total_score'] = total_score

        # 按总分排序
        results.sort(key=lambda x: x['total_score'], reverse=True)

        for i, r in enumerate(results, 1):
            print(f"{i}. {r['model']}")
            print(f"   综合评分: {r['total_score']:.1f}/100")
            print(f"   - 噪点得分: {r['noise_score']:.1f}/100")
            print(f"   - 清晰度得分: {r['sharp_score']:.1f}/100")
            print()

        # 推荐
        best = results[0]
        print("=" * 80)
        print(f"🏆 推荐模型: {best['model']}")
        print(f"   理由: 综合评分最高 ({best['total_score']:.1f}/100)")
        print("=" * 80)

    return results

if __name__ == '__main__':
    # 测试图片路径
    images = [
        ("A:\\\\Claude使用image出图\\\\2026-10\\\\serene-mountain-landscape_da5090.png", "gpt-image-2.5-flare"),
        ("A:\\\\Claude使用image出图\\\\2026-10\\\\serene-mountain-landscape_741a8d.png", "gpt-image-2.5-sunburst"),
    ]

    paths = [img[0] for img in images]
    models = [img[1] for img in images]

    compare_images(paths, models)
