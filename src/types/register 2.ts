export type RegisterData = {
    name: string;
    email: string;
    birthday: string;
    password: string;
  };

export type DateSelectProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
  };