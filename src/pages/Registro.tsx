
import { RegistroForm } from "@/components/RegistroForm";

export default function Registro() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite dark:bg-gray-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <RegistroForm />
      </div>
    </div>
  );
}
