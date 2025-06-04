"use client";

import { UserRole } from '@/components/auth/sign-up-form';
import ButterflyLoader from '@/components/butterfly-loader';
import { useRoleProtection } from '@/hooks/use-role-protection';
import React from 'react'

const UserManagementPage = () => {
    const { isAuthorized, isLoading } = useRoleProtection({
        allowedRoles: [UserRole.ADMIN]
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
    return (
        <div>UserManagementPage</div>
    )
}

export default UserManagementPage; 