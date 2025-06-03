import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 获取用户信息（更安全的方式）
  const { data: { user }, error } = await supabase.auth.getUser();

  // 获取当前路径
  const path = request.nextUrl.pathname;

  // 如果用户未登录且访问的不是登录页面，重定向到登录页面
  if (!user && path !== '/auth/login') {
    const redirectUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 如果用户已登录且访问的是登录页面，重定向到日历页面
  if (user && path === '/auth/login') {
    const redirectUrl = new URL('/calendar', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    // 根路径
    '/',
    // 需要认证的路径
    '/calendar/:path*',
    '/admin/:path*',
    // 登录页面
    '/auth/login',
  ],
};
