import React from "react";
import DevLoginForm from "@/components/forms/DevLoginForm";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">EventMaster</h1>
        <p className="mb-6 text-center text-gray-600">
          Plataforma de gerenciamento de eventos com IA
        </p>

        <Button 
          className="w-full mb-4"
          onClick={() => {
            window.location.href = "/api/login";
          }}
        >
          Entrar com Replit
        </Button>

        <div className="relative my-6">
          <Separator />
          <span className="absolute px-2 text-sm text-gray-500 -translate-x-1/2 -translate-y-1/2 bg-white left-1/2 top-1/2">
            ou
          </span>
        </div>

        <DevLoginForm />
      </div>
    </div>
  );
};

export default LoginPage;