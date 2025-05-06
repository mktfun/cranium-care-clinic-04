
import { LoginForm } from "@/components/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite dark:bg-gray-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <LoginForm />
      </div>
    </div>
  );
}
