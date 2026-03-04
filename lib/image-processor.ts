/**
 * 图片处理工具库
 * 使用Canvas API实现图片编辑功能(对比度、饱和度、锐度)
 */

export interface ImageFilters {
  brightness: number; // 0.5 - 1.5
  contrast: number;   // 0.5 - 1.5
  saturation: number; // 0.5 - 1.5
  sharpness: number;  // 0.5 - 1.5
}

/**
 * 将图片URL转换为Canvas并应用滤镜
 * @param imageUrl 图片URL
 * @param filters 滤镜参数
 * @returns 处理后的图片数据URL
 */
export async function applyFiltersToImage(
  imageUrl: string,
  filters: ImageFilters
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // 应用CSS滤镜效果
        const filterString = buildFilterString(filters);
        ctx.filter = filterString;

        // 绘制图片
        ctx.drawImage(img, 0, 0);

        // 如果需要锐度调整,使用卷积矩阵
        if (filters.sharpness !== 1) {
          applySharpenFilter(ctx, canvas, filters.sharpness);
        }

        // 转换为数据URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

/**
 * 构建CSS滤镜字符串
 */
function buildFilterString(filters: ImageFilters): string {
  const parts: string[] = [];

  // 亮度: 1 = 100%
  if (filters.brightness !== 1) {
    parts.push(`brightness(${(filters.brightness * 100).toFixed(0)}%)`);
  }

  // 对比度: 1 = 100%
  if (filters.contrast !== 1) {
    parts.push(`contrast(${(filters.contrast * 100).toFixed(0)}%)`);
  }

  // 饱和度: 1 = 100%
  if (filters.saturation !== 1) {
    parts.push(`saturate(${(filters.saturation * 100).toFixed(0)}%)`);
  }

  return parts.length > 0 ? parts.join(" ") : "none";
}

/**
 * 应用锐度滤镜(使用卷积矩阵)
 * 这是一个高级操作,需要像素级处理
 */
function applySharpenFilter(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  sharpness: number
): void {
  if (sharpness === 1) return; // 无需处理

  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 锐度卷积矩阵
  // 值越大,锐度越强
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ];

  // 根据sharpness参数调整卷积矩阵的强度
  const strength = (sharpness - 0.5) * 2; // 转换为 -1 到 1 的范围
  const adjustedKernel = kernel.map((row) =>
    row.map((val) => (val === 5 ? 5 + strength * 4 : val * strength))
  );

  // 应用卷积(简化版本,仅处理RGB通道)
  const width = canvas.width;
  const height = canvas.height;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // 对每个RGB通道应用卷积
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const neighborIdx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[neighborIdx] * adjustedKernel[ky + 1][kx + 1];
          }
        }
        data[idx + c] = Math.max(0, Math.min(255, sum));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * 检查浏览器是否支持Canvas
 */
export function isCanvasSupported(): boolean {
  const canvas = document.createElement("canvas");
  return !!(canvas.getContext && canvas.getContext("2d"));
}

/**
 * 检查图片是否可以跨域访问
 */
export async function checkImageCors(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    return response.ok;
  } catch {
    return false;
  }
}
