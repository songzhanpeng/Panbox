import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据初始化...');

  // 创建默认用户
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@panbox.com',
    },
  });
  console.log('✅ 创建默认用户:', user);

  // 创建默认分类
  const categories = [
    { name: '电子产品', description: '手机、电脑、平板等电子设备', color: '#3B82F6', icon: '📱' },
    { name: '家居用品', description: '家具、装饰品、生活用品', color: '#10B981', icon: '🏠' },
    { name: '服装配饰', description: '衣服、鞋子、包包、首饰', color: '#F59E0B', icon: '👕' },
    { name: '书籍文具', description: '图书、笔记本、文具用品', color: '#8B5CF6', icon: '📚' },
    { name: '运动健身', description: '运动器材、健身用品', color: '#EF4444', icon: '🏃' },
    { name: '美妆护肤', description: '化妆品、护肤品、香水', color: '#EC4899', icon: '💄' },
    { name: '厨房用品', description: '锅具、餐具、小家电', color: '#06B6D4', icon: '🍳' },
    { name: '其他', description: '其他未分类物品', color: '#6B7280', icon: '📦' },
  ];

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    });
    console.log('✅ 创建分类:', category.name);
  }

  // 创建默认标签
  const tags = [
    { name: '贵重物品', color: '#EF4444' },
    { name: '常用', color: '#10B981' },
    { name: '收藏品', color: '#8B5CF6' },
    { name: '礼品', color: '#F59E0B' },
    { name: '二手', color: '#6B7280' },
    { name: '全新', color: '#3B82F6' },
    { name: '限量版', color: '#EC4899' },
    { name: '待处理', color: '#F97316' },
  ];

  for (const tagData of tags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: tagData,
    });
    console.log('✅ 创建标签:', tag.name);
  }

  console.log('🎉 种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 