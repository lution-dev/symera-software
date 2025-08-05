import React from "react";
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/ui/logo";
import { useLocation } from "wouter";

const EmailVerification: React.FC = () => {
  const [, navigate] = useLocation();
  const [isResending, setIsResending] = React.useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Aqui você poderia implementar uma chamada real para reenviar o email
      // se o Replit Auth tivesse essa funcionalidade
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-orange-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 h-32 rounded-full bg-purple-200 opacity-20 top-10 left-10 animate-pulse"></div>
        <div className="absolute w-24 h-24 rounded-full bg-orange-200 opacity-20 bottom-20 right-10 animate-pulse" style={{animationDelay: "1s"}}></div>
        <div className="absolute w-40 h-40 rounded-full bg-purple-100 opacity-10 top-1/2 left-1/3 animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Symera</h1>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Verifique seu email
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enviamos um email de verificação para confirmar sua identidade
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email enviado</p>
                  <p className="text-xs text-gray-600">Verificação de segurança iniciada</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <Mail className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Verifique sua caixa de entrada</p>
                  <p className="text-xs text-gray-600">Clique no link de verificação no email</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Acesso liberado</p>
                  <p className="text-xs text-gray-400">Redirecionamento automático</p>
                </div>
              </div>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Não recebeu o email?
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Verifique sua pasta de spam ou lixo eletrônico</li>
                    <li>• Aguarde até 5 minutos para entrega</li>
                    <li>• Certifique-se que o email está correto</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Reenviar email
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={handleBackToLogin}
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao login
              </Button>
            </div>

            {/* Security note */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Esta verificação é uma medida de segurança para proteger sua conta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Segurança fornecida por{" "}
            <span className="font-medium text-gray-700">Replit Auth</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;