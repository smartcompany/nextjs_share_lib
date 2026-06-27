# nextjs-share-lib

Next.js 서버 프로젝트에서 공통으로 쓰는 OpenAI 설정 모듈입니다.  
`flutter_share_lib`와 같이 로컬 path dependency로 연결합니다.

## 설치

```json
// server/package.json
{
  "dependencies": {
    "nextjs-share-lib": "file:../../nextjs_share_lib"
  }
}
```

```ts
// server/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["nextjs-share-lib"],
};

export default nextConfig;
```

```bash
npm install
```

## 사용

```ts
import OpenAI from "openai";
import {
  openAIConfig,
  openAIChatConfig,
  createOpenAIClient,
  getOpenAIChatConfig,
} from "nextjs-share-lib";

const openai = createOpenAIClient();

const response = await openai.chat.completions.create({
  ...openAIConfig,
  messages: [{ role: "user", content: "Hello" }],
});
```

## 모델 교체

우선순위: 코드 override → `OPENAI_MODEL` → `OPENAI_MODEL_{PRESET}` → preset 기본값 (`gpt-5-mini`).

```bash
# 모든 API route에 적용
OPENAI_MODEL=gpt-4o-mini

# vision 전용 (preset: 'vision')
OPENAI_MODEL_VISION=gpt-4o

# completion token 상한
OPENAI_MAX_COMPLETION_TOKENS=4000
```

코드에서 preset 지정:

```ts
const visionConfig = getOpenAIChatConfig({ preset: "vision" });
```

## 기본 preset

| Preset | Default model |
|--------|---------------|
| `default` | `gpt-5-mini` |
| `vision` | `gpt-5-mini` |
| `reasoning` | `gpt-5-mini` |

preset 기본값은 `src/openai/config.ts`의 `OPENAI_MODEL_PRESETS`에서 한 곳만 수정하면 됩니다.
# nextjs_share_lib
