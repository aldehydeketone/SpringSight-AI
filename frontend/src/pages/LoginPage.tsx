import React, { useState } from 'react';
import { AuthLayout } from '../components/ui/auth-layout';
import { LoginCard } from '../components/ui/login-card';
import { LoginSuccessTransition } from '../components/ui/login-success-transition';

export const LoginPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccess = () => {
    setTimeout(() => {
      setIsSuccess(true);
    }, 300);
  };

  return (
    <>
      <AuthLayout isSuccess={isSuccess}>
        <LoginCard onSuccess={handleSuccess} />
      </AuthLayout>

      {isSuccess && <LoginSuccessTransition />}
    </>
  );
};
