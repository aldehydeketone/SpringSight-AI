import React from 'react';
import { AuthLayout } from '../components/ui/auth-layout';
import { SignUpCard } from '../components/ui/sign-up-card';

export const SignUpPage: React.FC = () => {
  return (
    <AuthLayout>
      <SignUpCard />
    </AuthLayout>
  );
};
