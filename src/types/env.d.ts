declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      // 腾讯云COS配置
      TENCENT_COS_SECRET_ID: string;
      TENCENT_COS_SECRET_KEY: string;
      TENCENT_COS_REGION: string;
      TENCENT_COS_BUCKET: string;
    }
  }
}
