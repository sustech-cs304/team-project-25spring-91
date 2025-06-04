'use client';

import { CompetitionsPage } from "@/components/competitions/competitions-page";
import ButterflyLoader from '@/components/butterfly-loader';
import { useRoleProtection } from '@/hooks/use-role-protection'
import { UserRole } from '@/components/auth/sign-up-form';

export default function CompetitionsPageRoute() {
    const { isAuthorized, isLoading } = useRoleProtection({
      allowedRoles: [UserRole.REGULAR_USER]
    });
    
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <ButterflyLoader />
        </div>
      );
    }
  
    if (!isAuthorized) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <ButterflyLoader />
        </div>
      );
    }

    return <CompetitionsPage />;
}
