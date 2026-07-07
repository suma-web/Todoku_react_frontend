import { createContext, useContext, useState } from "react";
import type { RegisterData } from "../types/register";

type RegisterContextType = {
  registerData: RegisterData;
  setRegisterData: React.Dispatch<React.SetStateAction<RegisterData>>;
  resetRegisterData: () => void;
};

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

const initialData: RegisterData = {
  name: "",
  email: "",
  birthday: "",
  password: "",
};

export const RegisterProvider = ({ children }: { children: React.ReactNode }) => {
  const [registerData, setRegisterData] = useState<RegisterData>(initialData);

  const resetRegisterData = () => {
    setRegisterData(initialData);
  };

  return (
    <RegisterContext.Provider
      value={{ registerData, setRegisterData, resetRegisterData }}
    >
      {children}
    </RegisterContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRegister = () => {
  const context = useContext(RegisterContext);

  if (!context) {
    throw new Error("useRegister must be used within RegisterProvider");
  }

  return context;
};
