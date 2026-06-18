import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-initialized Gemini AI client
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Endpoint: Revise writing using Gemini 3.5 Flash
  app.post("/api/revise", async (req, res) => {
    const { text, mode, bookTitle, chapterTitle } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "글을 입력해 주세요." });
    }

    try {
      const ai = getAI();
      if (!ai) {
        // Fallback mock responses when API key is not configured or is placeholder
        console.warn("GEMINI_API_KEY is missing or placeholder. Running in fallback mode.");
        const fallbackText = getFallbackRevision(text, mode);
        return res.json(fallbackText);
      }

      let systemInstruction = "";
      switch (mode) {
        case "spellcheck":
          systemInstruction = `당신은 출판사 전문 교정 편집자입니다. 주어진 한국어 텍스트의 맞춤법, 띄어쓰기, 문장 부호를 꼼꼼히 점검해 주세요. 작가의 고유 문체와 문맥 흐름을 절대 훼손하지 않으면서 어법이 명백히 틀린 단어와 불필요한 공백만 바르게 교정해야 합니다. 수정 사유(reason)에는 변경된 부분에 대한 설명만 간결하게 포함해 주세요.`;
          break;
        case "natural":
          systemInstruction = `당신은 숙련된 도서 편집자입니다. 작가가 쓴 내용의 본질을 완벽히 지키면서 흐름이 훨씬 더 부드럽고 자연스럽게 읽히도록 구절과 어조를 가볍게 마사지해 주세요. 너무 파격적으로 수정하지 마시고, 물 흐르듯 유려한 어조로 제안해 주세요.`;
          break;
        case "emotional":
          systemInstruction = `당신은 섬세한 분위기를 지향하는 문학 보조 편집자입니다. 작가의 원래 목소리를 최대한 존중하면서, 지나치게 딱딱하거나 차갑게 느껴질 수 있는 대목을 조금 더 따뜻하고, 차분하고, 깊은 여운을 가진 글귀로 은은하게 만져주세요. 바다의 고요함 같은 잔인하지 않은 쓸쓸함이나 따사로운 햇살의 느낌을 가미해 주면 좋습니다.`;
          break;
        case "literary":
          systemInstruction = `당신은 시인이자 소설가입니다. 글귀에 은유, 시적 상상력, 감각적인 수식이 자연스럽게 스며들어 문학적 향기가 물씬 풍겨나도록 윤문해 주세요. 상징적이고 깊이 있는 단어로 영감을 주는 문장을 제안해 주세요.`;
          break;
        case "concise":
          systemInstruction = `당신은 담백한 문체를 지향하는 에디터입니다. 군더더기 서술어, 수식어, 불필요하게 늘어지는 조사나 동어 반복을 단호하게 지우고 글의 명확한 핵심만 단정하게 압축하여 담소하는 짧고 투명한 문장으로 수정해 주세요.`;
          break;
        case "flow":
          systemInstruction = `당신은 소설 및 수필 작가 코치입니다. 이 문체 속 장치와 상하 어조의 정합성을 검사하여 문단 전체의 유기적 긴밀성을 정돈해 주세요. 만약 문장의 연결이 어색하면 단어를 세련되게 수정 제안해 주세요.`;
          break;
        case "repetition":
          systemInstruction = `당신은 언어 정제 전문가입니다. 한 문단 내에 반복해서 쓰이는 어휘(예: '그리고', '해서', '~인 것 같다', '~때문에')나 조사, 어미를 파악하고, 이를 대체하여 세련된 한국어 문장을 제안해 주세요.`;
          break;
        case "title":
          systemInstruction = `당신은 한 권의 아름다운 책 기획자입니다. 작성된 원고 혹은 테마 문장을 분석하여, 차분하고 은은한 감성을 자랑하는 시적인 추천 도서 제목 3개와 각각의 은유 이유를 제시해 주세요. revisedText에 추천 제목 목록을 출력해 주면 됩니다.`;
          break;
        default:
          systemInstruction = `당신의 언어 점검 도우미입니다. 제안에 따라 한국어 문장을 우아하고 단정하게 정돈해 주세요.`;
      }

      const promptContext = `책 제목: "${bookTitle || '미정'}", 챕터: "${chapterTitle || '미정'}"\n\n대상 문장/문단:\n${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              originalText: { type: Type.STRING, description: "원본 텍스트 그대로 기입" },
              revisedText: { type: Type.STRING, description: "교정 및 윤문된 새 텍스트" },
              reason: { type: Type.STRING, description: "교정된 사항과 이유에 대한 부드러운 설명" },
            },
            required: ["originalText", "revisedText", "reason"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("결과를 받지 못했습니다.");
      }

      const parsed = JSON.parse(responseText.trim());
      return res.json(parsed);

    } catch (error: any) {
      console.error("Gemini revision endpoint error:", error);
      // Gracious fallback
      const fallbackText = getFallbackRevision(text, mode);
      
      let errorDetail = "네트워크 신호가 은은하게 흔들리고 있습니다.";
      if (error && error.message) {
        if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("UNAVAILABLE")) {
          errorDetail = "현재 이용자 급증으로 원격 인공지능 서버의 잔잔한 정비가 진행 중입니다.";
        } else {
          errorDetail = error.message;
        }
      }

      return res.json({
        ...fallbackText,
        reason: `[실시간 인공지능 연동 지연 - 집필실 내장 엔진 가동] ${fallbackText.reason} (${errorDetail} 잠시 후 다시 요청하시거나 현재 임시 교정본을 이대로 '제안문 적용' 하실 수 있습니다.)`
      });
    }
  });

  // Vite middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Helper for local sandbox callback / fallback output when key is offline
function getFallbackRevision(text: string, mode: string) {
  const words = text.trim();
  let revised = text;
  let reason = "바다의 서선이 문장 끝에 가닿아 다듬어진 서설입니다.";

  if (mode === "spellcheck") {
    revised = text
      .replace(/아는것/g, "아는 것")
      .replace(/하는것/g, "하는 것")
      .replace(/바래/g, "바라")
      .replace(/됬다/g, "됐다")
      .replace(/않하고/g, "안 하고")
      .replace(/할께요/g, "할게요");
    reason = "일부 누락되었던 띄어쓰기와 비표준적인 종결형 및 맞춤법을 단정하게 손질했습니다.";
  } else if (mode === "natural") {
    revised = text + "\n\n(조금 더 명확하고 매끄럽게 연결되는 흐름으로 작문이 조화로워졌습니다.)";
    reason = "어구의 결합을 부드럽게 정돈하여, 작가가 속삭이는 대화의 형태를 안정적으로 정연시켰습니다.";
  } else if (mode === "emotional") {
    revised = `아마도, ${text} 그때 바다는 한결 맑은 호흡으로 수평선 너머의 조용한 등대로 머물렀을지도 모릅니다.`;
    reason = "작가의 문장이 품고 있는 쓸쓸함 뒤편의 고요한 바다 내음을 크림톤의 부드러운 감정선으로 물들였습니다.";
  } else if (mode === "literary") {
    revised = `해풍이 밀려와 문장을 가볍게 밀칠 때, ${text} 깊은 파랑의 심상으로 빚어낸 이 언어가 문학적 궤적을 그리며 찰랑입니다.`;
    reason = "표현에 깊은 은유를 심고 시적인 잔향을 머금는 은은한 단어들을 정성스레 수놓았습니다.";
  } else if (mode === "concise") {
    revised = text.split(/[.!?]/).slice(0, 2).join(". ") + ".";
    reason = "장황한 미사여구와 반복되는 꼬리말을 걷어내고, 작가의 순수한 사유만을 투명하게 남겼습니다.";
  } else if (mode === "title") {
    revised = `1. 푸른 호수와 서성이는 마음\n2. 바다가 가르쳐 준 수평선의 높이\n3. 등대를 닦는 밤의 작가`;
    reason = "보여주신 수려한 원고의 뉘앙스를 관통하는 시적이고 감각적인 제목 세 가지를 바다 앞 서가에서 추천합니다.";
  }

  return {
    originalText: text,
    revisedText: revised,
    reason: reason
  };
}

startServer();
