import { Share, Platform, Linking, Alert } from 'react-native';

export interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
  type?: 'photo' | 'style' | 'repair';
}

export interface ShareMethod {
  name: string;
  icon: string;
  action: () => void;
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
 * 分享到微信 - 支持多个URL scheme
 */
export const shareToWeChat = (message: string) => {
  // 支持多个微信URL scheme（iOS、Android、Mac）
  const possibleSchemes = [
    'weixin://',      // 标准微信scheme
    'wechat://',      // 备用scheme
    'wxapi://',       // API scheme
  ];

  const tryNextScheme = (index: number) => {
    if (index >= possibleSchemes.length) {
      Alert.alert('未安装微信', '请先安装微信应用');
      return;
    }

    const scheme = possibleSchemes[index];
    Linking.canOpenURL(scheme)
      .then(supported => {
        if (supported) {
          // 微信已安装，尝试打开
          Linking.openURL(scheme).catch(() => {
            // 如果打开失败，尝试下一个scheme
            tryNextScheme(index + 1);
          });
          Alert.alert('提示', '请在微信中手动分享此内容');
        } else {
          // 尝试下一个scheme
          tryNextScheme(index + 1);
        }
      })
      .catch(() => {
        // 如果检查失败，尝试下一个scheme
        tryNextScheme(index + 1);
      });
  };

  tryNextScheme(0);
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

/**
 * 获取一键分享的所有可用分享方式
 * 包括固定的四种方式（邮件、信息、微信、蓝牙）和动态检测的其他应用
 */
export const getShareMethods = async (message: string, subject: string): Promise<ShareMethod[]> => {
  const methods: ShareMethod[] = [];

  // 固定的四种分享方式
  methods.push({
    name: '📧 邮件',
    icon: 'mail',
    action: () => shareToEmail(subject, message),
  });

  methods.push({
    name: '💬 信息',
    icon: 'message',
    action: () => shareToSMS(message),
  });

  methods.push({
    name: '💚 微信',
    icon: 'wechat',
    action: () => shareToWeChat(message),
  });

  methods.push({
    name: '🔵 蓝牙',
    icon: 'bluetooth',
    action: () => shareViaBluetooth(message),
  });

  // 动态检测其他应用（如QQ、微博、抖音等）
  const otherApps = [
    { name: '🐧 QQ', scheme: 'mqq://', action: () => Linking.openURL('mqq://') },
    { name: '🌟 微博', scheme: 'sinaweibo://', action: () => Linking.openURL('sinaweibo://') },
    { name: '🎵 抖音', scheme: 'snssdk1128://', action: () => Linking.openURL('snssdk1128://') },
    { name: '📱 WhatsApp', scheme: 'whatsapp://', action: () => Linking.openURL('whatsapp://') },
    { name: '📲 Telegram', scheme: 'tg://', action: () => Linking.openURL('tg://') },
  ];

  // 检测这些应用是否已安装
  for (const app of otherApps) {
    try {
      const canOpen = await Linking.canOpenURL(app.scheme);
      if (canOpen) {
        methods.push({
          name: app.name,
          icon: app.name,
          action: app.action,
        });
      }
    } catch (error) {
      // 应用检测失败，跳过
      console.log(`Failed to check app: ${app.name}`);
    }
  }

  return methods;
};

/**
 * 显示一键分享菜单
 */
export const showShareMenu = async (message: string, subject: string) => {
  const methods = await getShareMethods(message, subject);
  
  const options = [
    ...methods.map(method => ({
      text: method.name,
      onPress: method.action,
    })),
    { text: '取消', onPress: () => {}, style: 'cancel' as const },
  ];

  Alert.alert('分享到', '选择分享方式', options);
};
