import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 检查是否在服务器环境中
function isServerEnvironment() {
  return typeof window === 'undefined';
}

// 创建Supabase服务端客户端（只读模式，用于页面组件）
export const createSupabaseServerClient = async () => {
  // 确保只在服务器环境中运行
  if (!isServerEnvironment()) {
    throw new Error('createSupabaseServerClient can only be used in server environment');
  }

  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // 在页面组件中不允许设置cookies
            // 这将防止在页面渲染时出现cookies修改错误
          }
        },
      },
    }
  );
};

// 创建Supabase服务端客户端（可写模式，用于Server Actions和Route Handlers）
export const createSupabaseServerClientWithCookies = async () => {
  // 确保只在服务器环境中运行
  if (!isServerEnvironment()) {
    throw new Error('createSupabaseServerClientWithCookies can only be used in server environment');
  }

  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
};

// 创建Supabase管理员客户端（使用service role key，用于用户管理等管理操作）
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Admin client 不需要设置 cookies
        },
      },
    }
  );
};