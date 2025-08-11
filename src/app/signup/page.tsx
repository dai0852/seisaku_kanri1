"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { FolderKanban } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "エラー",
        description: "パスワードが一致しません。",
        variant: "destructive",
      });
      return;
    }

    try {
      const { auth, db } = await getFirebaseInstances();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      
      // Firestoreにユーザー情報を保存
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        approved: false,
        role: 'user', // Add role field
      });
      
      toast({
        title: "新規登録が完了しました",
        description: "管理者の承認をお待ちください。",
      });
      router.push("/login");

    } catch (error: any) {
      console.error("Signup failed:", error);
      let message = "登録に失敗しました。";
      if (error.code === 'auth/email-already-in-use') {
        message = "このメールアドレスは既に使用されています。";
      } else if (error.code === 'auth/weak-password') {
        message = "パスワードは6文字以上で入力してください。";
      }
      toast({
        title: "登録エラー",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center shadow-md">
                    <FolderKanban className="h-8 w-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>
            アカウントを作成して利用を開始しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">パスワード（確認）</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              登録する
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            すでにアカウントをお持ちですか？{" "}
            <Link href="/login" className="underline">
              ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
