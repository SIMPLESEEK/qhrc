import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  // 获取当前用户
  const user = await getCurrentUser();

  // 如果用户已登录，重定向到日历页面
  if (user) {
    redirect('/calendar');
  } else {
    // 如果用户未登录，重定向到登录页面
    redirect('/auth/login');
  }

  // 这部分代码不会执行，但为了类型安全而添加
  return null;
}
