// import { createClient } from '@supabase/supabase-js';

// /**
//  * 베타 테스트용 더미 사용자를 관리하는 유틸리티
//  */
// export class BetaUserManager {
//   private supabase;

//   constructor() {
//     this.supabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
//     );
//   }

//   /**
//    * 베타 테스트용 더미 사용자를 생성합니다
//    */
//   async createBetaDummyUser(): Promise<string | null> {
//     try {
//       const { data, error } = await this.supabase.auth.admin.createUser({
//         email: `beta-dummy-${Date.now()}@trufu.beta`,
//         email_confirm: true,
//         user_metadata: {
//           is_beta: true,
//         },
//         app_metadata: {
//           app_version: '0.1.0',
//         },
//       });

//       if (error) {
//         console.error('Failed to create beta dummy user:', error);
//         return null;
//       }

//       return data.user.id;
//     } catch (error) {
//       console.error('Beta dummy user creation error:', error);
//       return null;
//     }
//   }

//   /**
//    * 고정된 베타 사용자 ID를 반환합니다
//    * 실제 운영에서는 미리 생성된 베타 사용자 ID 풀을 사용
//    */
//   getFixedBetaUserId(): string {
//     // 이 ID는 실제 Supabase에 존재해야 합니다
//     // 실제 운영시에는 미리 생성된 베타 사용자 ID를 사용하세요
//     return '00000000-0000-0000-0000-000000000001'; // 예시 ID
//   }
// }
