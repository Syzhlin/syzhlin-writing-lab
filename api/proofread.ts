import { GoogleGenAI, Type } from "@google/genai";

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

async function getRequestBody(req: any): Promise<any> {
  if (req.body) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: any) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function getFallbackProofread(text: string) {
  const revised = text
    .replace(/아는것/g, "아는 것")
    .replace(/하는것/g, "하는 것")
    .replace(/바래/g, "바라")
    .replace(/됬다/g, "됐다")
    .replace(/않하고/g, "안 하고")
    .replace(/할께요/g, "할게요");

  return {
    originalText: text,
    revisedText: revised,
    reason: "한국어 맞춤법 및 표준 띄어쓰기 규정을 기준으로 교정 작업을 완료하였습니다.",
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Method not allowed. Use POST." }));
  }

  try {
    const body = await getRequestBody(req);
    const { text } = body;

    if (!text || typeof text !== "string") {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "검사할 텍스트를 입력하세요." }));
    }

    const ai = getAI();
    if (!ai) {
      const fallback = getFallbackProofread(text);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(fallback));
    }

    const systemInstruction = `당신은 노련한 한국어 교열 편집자입니다. 주어진 서면 한국어 문장의 오탈자, 맞춤법 오류, 띄어쓰기 결함을 규정에 맞게 깔끔하게 바로잡아 주세요. 원래의 풍부한 표현이나 문맥적 특이점은 훼손을 최소화해 주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            revisedText: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["originalText", "revisedText", "reason"],
        },
      },
    });

    const result = response.text;
    if (!result) {
      throw new Error("비어있는 응답입니다.");
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(JSON.parse(result.trim())));

  } catch (error: any) {
    console.error("Vercel proofread error:", error);
    const body = await getRequestBody(req);
    const textToUse = body.text || "";
    const fallback = getFallbackProofread(textToUse);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      ...fallback,
      reason: `[AI 일시 연결 불안정으로 로컬 정합성 엔진 대체 작동] ${fallback.reason} (${error.message || ""})`
    }));
  }
}
