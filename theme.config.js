/** @type {const} */
const themeColors = {
  // 奢华金色主题
  primary: { light: '#D4AF37', dark: '#FFD700' }, // 金色
  secondary: { light: '#8B7355', dark: '#C19A6B' }, // 古铜色
  accent: { light: '#2C2416', dark: '#F5E6D3' }, // 深棕/米白
  
  // 背景层次
  background: { light: '#FAFAFA', dark: '#0A0A0A' }, // 极浅灰/极深黑
  surface: { light: '#FFFFFF', dark: '#1A1A1A' }, // 纯白/深灰
  elevated: { light: '#F5F5F5', dark: '#252525' }, // 浅灰/中灰
  
  // 文字颜色
  foreground: { light: '#1A1A1A', dark: '#F5F5F5' }, // 深黑/浅白
  muted: { light: '#6B6B6B', dark: '#A0A0A0' }, // 中灰
  subtle: { light: '#9E9E9E', dark: '#707070' }, // 浅灰
  
  // 边框和分隔
  border: { light: '#E8E8E8', dark: '#2A2A2A' },
  divider: { light: '#F0F0F0', dark: '#1F1F1F' },
  
  // 功能色
  success: { light: '#059669', dark: '#10B981' },
  warning: { light: '#D97706', dark: '#F59E0B' },
  error: { light: '#DC2626', dark: '#EF4444' },
  
  // 渐变色(用于特殊效果)
  gradientStart: { light: '#D4AF37', dark: '#FFD700' },
  gradientEnd: { light: '#8B7355', dark: '#C19A6B' },
};

module.exports = { themeColors };
