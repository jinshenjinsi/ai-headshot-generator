import { Share, Platform, Linking, Alert } from 'react-native';

export interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
  type?: 'photo' | 'style' | 'repair';
}

/**
 * 自定义分享功能，支持邮件、信息、微信、蓝牙
 */
export const customShare = async (options: ShareOptions) => {
  const { message, type = 'photo' } = options;

  // 根据类型生成不同的分享文案
  const shareMessages = {
    photo: `📷 我用「元一图灵」生成了一张专业证件照，效果真的不错！😎\n\n${message}`,
    style: `✨ 我用「元一图灵」生成了一张艺术风格照片，太棒了！🎨\n\n${message}`,
    repair: `🔧 我用「元一图灵」修复了一张老照片，效果真的不错！📸\n\n${message}`,
  };

  const finalMessage = shareMessages[type] || message;

  // 尝试使用系统分享菜单
  try {
    await Share.share({
      message: finalMessage,
      title: '元一图灵 - 专业证件照在家搞定',
    });
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('分享失败', '请稍后重试');
  }
};

/**
 * 分享到邮件
 */
export const shareToEmail = (subject: string, body: string) => {
  const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  Linking.openURL(emailUrl).catch(() => {
    Alert.alert('无法打开邮件', '您的设备未配置邮件应用');
  });
};

/**
 * 分享到短信
 */
export const shareToSMS = (message: string) => {
  const smsUrl = Platform.OS === 'ios' 
    ? `sms:&body=${encodeURIComponent(message)}`
    : `smsto:?body=${encodeURIComponent(message)}`;
  
  Linking.openURL(smsUrl).catch(() => {
    Alert.alert('无法打开短信', '您的设备未配置短信应用');
  });
};

/**
 * 分享到微信
 */
export const shareToWeChat = (message: string) => {
  // 微信的URL scheme
  const wechatUrl = `weixin://`;
  
  Linking.canOpenURL(wechatUrl).then(supported => {
    if (supported) {
      // 微信已安装，尝试打开
      Linking.openURL(wechatUrl);
      Alert.alert('提示', '请在微信中手动分享此内容');
    } else {
      Alert.alert('未安装微信', '请先安装微信应用');
    }
  });
};

/**
 * 分享到蓝牙
 */
export const shareViaBluetooth = (message: string) => {
  // 蓝牙分享通常通过系统分享菜单实现
  // 这里提供一个提示
  Alert.alert(
    '蓝牙分享',
    '请使用系统分享菜单选择蓝牙设备进行分享',
    [{ text: '确定' }]
  );
};

/**
 * 获取分享文案
 */
export const getShareMessage = (type: 'photo' | 'style' | 'repair'): string => {
  const messages = {
    photo: '不需要去照相馆，在家就能一键生成专业证件照。支持护照、签证、工作证等多种用途。',
    style: '一张照片，十种风格。从商务风格到艺术风格，总有一款适合你。',
    repair: '智能修复老照片，去除噪点、提升清晰度。让珍贵回忆更清晰。',
  };
  
  return messages[type];
};
