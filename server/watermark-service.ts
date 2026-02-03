/**
 * 水印服务 - 为生成的头像添加二维码水印
 * 
 * 功能:
 * 1. 生成二维码图片(指向APP下载页)
 * 2. 将二维码水印添加到图片右下角
 * 3. 生成降低分辨率的预览版(512×683)
 */

import sharp from 'sharp';
import QRCode from 'qrcode';
import axios from 'axios';

/**
 * 生成二维码图片Buffer
 * @param url 二维码指向的URL
 * @param size 二维码尺寸(像素)
 * @returns 二维码PNG图片Buffer
 */
async function generateQRCode(url: string, size: number = 120): Promise<Buffer> {
  try {
    const qrBuffer = await QRCode.toBuffer(url, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrBuffer;
  } catch (error) {
    console.error('生成二维码失败:', error);
    throw new Error('生成二维码失败');
  }
}

/**
 * 为图片添加水印
 * @param imageUrl 原图URL
 * @param qrCodeUrl 二维码指向的URL
 * @param options 水印选项
 * @returns 带水印的图片Buffer
 */
export async function addWatermark(
  imageUrl: string,
  qrCodeUrl: string,
  options: {
    qrSize?: number;        // 二维码尺寸,默认120px
    opacity?: number;       // 透明度,0-1,默认0.3
    padding?: number;       // 边距,默认20px
    previewWidth?: number;  // 预览版宽度,默认512px
  } = {}
): Promise<{ preview: Buffer; original: Buffer }> {
  const {
    qrSize = 120,
    opacity = 0.3,
    padding = 20,
    previewWidth = 512
  } = options;

  try {
    // 1. 下载原图
    console.log('下载原图:', imageUrl);
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const originalBuffer = Buffer.from(response.data);

    // 2. 获取原图信息
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();
    const originalWidth = metadata.width || 640;
    const originalHeight = metadata.height || 1536;

    console.log('原图尺寸:', originalWidth, 'x', originalHeight);

    // 3. 生成二维码
    console.log('生成二维码:', qrCodeUrl);
    const qrBuffer = await generateQRCode(qrCodeUrl, qrSize);

    // 4. 创建半透明二维码
    const transparentQR = await sharp(qrBuffer)
      .ensureAlpha()
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
        raw: {
          width: 1,
          height: 1,
          channels: 4
        },
        tile: true,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    // 5. 计算水印位置(右下角)
    const left = originalWidth - qrSize - padding;
    const top = originalHeight - qrSize - padding;

    // 6. 生成预览版(降低分辨率+添加水印)
    const previewHeight = Math.round((originalHeight / originalWidth) * previewWidth);
    console.log('生成预览版:', previewWidth, 'x', previewHeight);

    const previewBuffer = await sharp(originalBuffer)
      .resize(previewWidth, previewHeight, {
        fit: 'cover',
        position: 'center'
      })
      .composite([{
        input: transparentQR,
        left: Math.round((left / originalWidth) * previewWidth),
        top: Math.round((top / originalHeight) * previewHeight)
      }])
      .jpeg({ quality: 85 })
      .toBuffer();

    // 7. 原图保持高清无水印
    console.log('原图保持高清无水印');

    return {
      preview: previewBuffer,
      original: originalBuffer
    };
  } catch (error) {
    console.error('添加水印失败:', error);
    throw new Error('添加水印失败');
  }
}

/**
 * 上传图片到S3并返回URL
 * @param buffer 图片Buffer
 * @param filename 文件名
 * @returns 图片URL
 */
export async function uploadToS3(buffer: Buffer, filename: string): Promise<string> {
  // TODO: 集成S3上传
  // 目前返回临时URL,后续需要实现真实的S3上传
  console.log('上传图片到S3:', filename);
  
  // 临时方案: 使用manus-upload-file命令行工具
  const fs = await import('fs');
  const path = await import('path');
  const { execSync } = await import('child_process');
  
  const tempDir = '/tmp/watermarked';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempPath = path.join(tempDir, filename);
  fs.writeFileSync(tempPath, buffer);
  
  try {
    const result = execSync(`manus-upload-file ${tempPath}`, { encoding: 'utf-8' });
    const url = result.trim();
    console.log('上传成功:', url);
    
    // 清理临时文件
    fs.unlinkSync(tempPath);
    
    return url;
  } catch (error) {
    console.error('上传失败:', error);
    throw new Error('上传图片失败');
  }
}
