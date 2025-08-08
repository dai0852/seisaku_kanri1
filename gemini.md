# アプリケーション開発ガイドライン

このドキュメントは、Seisaku Managerアプリケーションの品質、保守性、安全性を確保するための開発ガイドラインを定めたものです。

## 1. セキュリティ: 機密情報の管理

APIキーやデータベース接続情報などの機密情報は、ソースコードから完全に分離し、安全に管理する必要があります。

### 方針

- **環境変数の利用:** すべての機密情報は環境変数を使用して管理します。ソースコード内に直接書き込む（ハードコーディングする）ことは禁止します。
- **`.env.local` ファイル:** ローカル開発環境では、プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、環境変数を定義します。
    - このファイルはGitの管理対象から除外するため、必ず `.gitignore` ファイルに `.env.local` を追記します。
- **クライアントサイドでの利用:** Next.jsの仕様に従い、ブラウザ上で利用する必要がある環境変数には `NEXT_PUBLIC_` というプレフィックスを付けます。
- **本番環境:** Firebase App Hostingなどの本番環境では、各サービスのダッシュボード上で直接環境変数を設定します。

### .env.local ファイルの例

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

## 2. アーキテクチャ: 堅牢性と拡張性

将来的な機能追加や技術のアップデートに容易に対応できる、堅牢で保守性の高いアーキテクチャを採用します。

### 方針

- **コンポーネントの関心を分離する (Separation of Concerns):**
    - **UIコンポーネント (`components/ui/`):** ShadCN UIをベースとした再利用可能な基本部品。状態を持たず、propsを通じてのみ制御されます。
    - **機能コンポーネント (`components/`):** アプリケーションの特定機能を持つ部品。UIコンポーネントを組み合わせて構築し、状態管理やビジネスロジックの一部を持ちます。（例: `add-project-dialog.tsx`）
    - **ページコンポーネント (`app/`):** 各ページのレイアウトを定義し、複数の機能コンポーネントを配置します。

- **状態管理 (State Management):**
    - **ローカルステート:** 個別のコンポーネント内でのみ利用される状態は、`useState` や `useReducer` を使用します。
    - **グローバルステート:** 複数のコンポーネントで共有される状態（プロジェクト一覧、ユーザー情報など）は、`React Context` を使用して一元管理します。（例: `context/app-context.tsx`, `context/auth-context.tsx`）

- **ロジックの分離:**
    - **ビジネスロジック:** 状態の更新やデータの加工などのコアなロジックは、Context内やカスタムフック (`hooks/`) に集約し、コンポーネントから分離します。
    - **Firebase関連処理:** FirestoreやAuthとのやり取りは `lib/firebase.ts` を中心に行い、コンポーネントが直接FirebaseのAPIを呼び出さないようにします。

- **型定義:**
    - `TypeScript` を全面的に採用し、`lib/types.ts` のようなファイルでアプリケーション全体で利用する型定義を共有します。これにより、開発時のエラーを削減し、コードの可読性を高めます。

- **ディレクトリ構成:**
    - `src/` ディレクトリ以下に、役割ごとに明確にフォルダを分割し、ファイルがどこにあるべきか予測しやすくします。
        - `app/`: ルーティングとページ
        - `components/`: UI・機能コンポーネント
        - `context/`: グローバル状態管理
        - `hooks/`: カスタムフック
        - `lib/`: Firebase設定、型定義、共通関数など
        - `ai/`: Genkit関連のAI機能
