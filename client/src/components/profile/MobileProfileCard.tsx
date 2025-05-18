import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface MobileProfileCardProps {
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  onChooseImage: () => void;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MobileProfileCard: React.FC<MobileProfileCardProps> = ({
  firstName,
  lastName,
  profileImageUrl,
  onChooseImage,
  onRemoveImage,
  fileInputRef,
  handleImageUpload
}) => {
  return (
    <div className="bg-gradient-to-b from-primary/10 to-primary/5 rounded-2xl shadow-lg overflow-hidden">
      <div className="pt-6 pb-4 px-4 text-center">
        <div className="relative mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-primary/20 rounded-full blur-xl opacity-50"></div>
          <Avatar className="h-32 w-32 mx-auto border-4 border-white relative z-10">
            {profileImageUrl ? (
              <AvatarImage 
                src={profileImageUrl} 
                alt={`${firstName} ${lastName}`} 
              />
            ) : null}
            <AvatarFallback className="text-3xl font-bold text-white bg-gradient-to-r from-primary to-primary/70">
              {getInitials(`${firstName} ${lastName}`)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <h2 className="text-xl font-bold text-primary mb-1">{firstName} {lastName}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Atualize sua foto de perfil
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <div className="grid grid-cols-1 gap-3 mt-4">
          <Button 
            variant="default" 
            className="w-full py-6 text-white font-medium rounded-xl text-base"
            onClick={onChooseImage}
          >
            Escolher Foto
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full py-6 font-medium rounded-xl text-base"
            onClick={onRemoveImage}
            disabled={!profileImageUrl}
          >
            Remover Foto
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileProfileCard;