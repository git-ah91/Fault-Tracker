import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      setLocation("/dashboard");
      toast({
        title: "Login successful",
        description: "Welcome to the Maintenance Fault System!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const demoUsers = [
    { role: "Admin", username: "admin", password: "admin123" },
    { role: "Editor", username: "editor", password: "editor123" },
    { role: "Viewer", username: "viewer", password: "viewer123" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Maintenance Fault System
          </CardTitle>
          <CardDescription className="mt-2">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          disabled={isLoggingIn}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Demo Users:</p>
            <div className="mt-2 text-xs space-y-1">
              {demoUsers.map((user) => (
                <div key={user.username} className="flex justify-between">
                  <span className="text-gray-500">{user.role}:</span>
                  <span className="text-primary">{user.username}/{user.password}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
