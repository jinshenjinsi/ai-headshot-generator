import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FreeUsageData {
  // 用户标识
  userId: string;
  
  // 证照和美照共用
  photoAndStyleFreeCount: number;
  photoAndStyleLastResetDate: string;
  
  // 照片修复单独
  repairFreeCount: number;
  repairLastResetDate: string;
}

const STORAGE_KEY = 'free_usage_data';
const USER_ID_KEY = 'user_id';

/**
 * 生成或获取用户ID
 */
async function getUserId(): Promise<string> {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      // 生成新的用户ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      userId = `user_${timestamp}_${random}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return `user_${Date.now()}`;
  }
}

const INITIAL_DATA: FreeUsageData = {
  userId: '',
  photoAndStyleFreeCount: 3,
  photoAndStyleLastResetDate: new Date().toISOString().split('T')[0],
  repairFreeCount: 1,
  repairLastResetDate: new Date().toISOString().split('T')[0],
};

/**
 * 获取免费使用数据
 */
export async function getFreeUsageData(): Promise<FreeUsageData> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      // 首次使用，初始化数据
      const userId = await getUserId();
      const initialData = { ...INITIAL_DATA, userId };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    const parsedData = JSON.parse(data);
    // 确保userId存在
    if (!parsedData.userId) {
      parsedData.userId = await getUserId();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    }
    return parsedData;
  } catch (error) {
    console.error('Failed to get free usage data:', error);
    return INITIAL_DATA;
  }
}

/**
 * 获取当前用户ID
 */
export async function getCurrentUserId(): Promise<string> {
  return await getUserId();
}

/**
 * 检查证照/美照是否有免费次数
 */
export async function canUsePhotoAndStyleFree(): Promise<boolean> {
  const data = await getFreeUsageData();
  const today = new Date().toISOString().split('T')[0];
  
  // 如果是新的一天，重置为1次免费
  if (data.photoAndStyleLastResetDate !== today) {
    data.photoAndStyleFreeCount = 1;
    data.photoAndStyleLastResetDate = today;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  }
  
  return data.photoAndStyleFreeCount > 0;
}

/**
 * 检查照片修复是否有免费次数
 */
export async function canUseRepairFree(): Promise<boolean> {
  const data = await getFreeUsageData();
  const today = new Date().toISOString().split('T')[0];
  
  // 照片修复没有每日重置，只有初始1次免费
  if (data.repairFreeCount > 0) {
    return true;
  }
  
  return false;
}

/**
 * 使用一次证照/美照免费次数
 */
export async function usePhotoAndStyleFree(): Promise<void> {
  const data = await getFreeUsageData();
  if (data.photoAndStyleFreeCount > 0) {
    data.photoAndStyleFreeCount--;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

/**
 * 使用一次照片修复免费次数
 */
export async function useRepairFree(): Promise<void> {
  const data = await getFreeUsageData();
  if (data.repairFreeCount > 0) {
    data.repairFreeCount--;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

/**
 * 获取证照/美照剩余免费次数
 */
export async function getPhotoAndStyleFreeCount(): Promise<number> {
  const data = await getFreeUsageData();
  const today = new Date().toISOString().split('T')[0];
  
  // 如果是新的一天，重置为1次免费
  if (data.photoAndStyleLastResetDate !== today) {
    data.photoAndStyleFreeCount = 1;
    data.photoAndStyleLastResetDate = today;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  
  return data.photoAndStyleFreeCount;
}

/**
 * 获取照片修复剩余免费次数
 */
export async function getRepairFreeCount(): Promise<number> {
  const data = await getFreeUsageData();
  return data.repairFreeCount;
}

/**
 * 获取用户统计信息
 */
export async function getUserStats(): Promise<{
  userId: string;
  photoAndStyleUsed: number;
  photoAndStyleRemaining: number;
  repairUsed: number;
  repairRemaining: number;
}> {
  const data = await getFreeUsageData();
  return {
    userId: data.userId,
    photoAndStyleUsed: 3 - data.photoAndStyleFreeCount,
    photoAndStyleRemaining: data.photoAndStyleFreeCount,
    repairUsed: 1 - data.repairFreeCount,
    repairRemaining: data.repairFreeCount,
  };
}

/**
 * 重置所有数据（用于测试）
 */
export async function resetFreeUsageData(): Promise<void> {
  const userId = await getUserId();
  const resetData = { ...INITIAL_DATA, userId };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
}
