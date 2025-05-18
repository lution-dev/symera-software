import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface NovoPerfilProps {
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  onChooseImage: () => void;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const NovoPerfil: React.FC<NovoPerfilProps> = ({
  firstName,
  lastName,
  profileImageUrl,
  onChooseImage,
  onRemoveImage,
  fileInputRef,
  handleImageUpload
}) => {
  return (
    <div className="bg-blue-500 text-white rounded-xl overflow-hidden shadow-xl pb-2">
      <div className="bg-blue-600 p-4 mb-4">
        <h2 className="text-2xl font-bold text-center">NOVA VERSÃO DO CARD</h2>
      </div>
      
      <div className="flex flex-col items-center p-4">
        <div className="relative mb-4">
          <Avatar className="h-28 w-28 border-4 border-white">
            {profileImageUrl ? (
              <AvatarImage 
                src={profileImageUrl} 
                alt={`${firstName} ${lastName}`} 
              />
            ) : null}
            <AvatarFallback className="text-2xl font-bold bg-blue-700 text-white">
              {getInitials(`${firstName} ${lastName}`)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <h2 className="text-xl font-bold mb-1">{firstName} {lastName}</h2>
        <p className="text-sm text-blue-100 mb-6">
          Atualize sua foto de perfil
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <div className="flex flex-col w-full gap-3">
          <Button 
            className="w-full bg-white text-blue-600 hover:bg-blue-50 py-6 font-bold text-base"
            onClick={onChooseImage}
          >
            ESCOLHER FOTO
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-white text-white hover:bg-blue-600 py-6 font-bold text-base"
            onClick={onRemoveImage}
            disabled={!profileImageUrl}
          >
            REMOVER FOTO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NovoPerfil;