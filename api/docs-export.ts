import { google } from "googleapis";

async function getRequestBody(req: any): Promise<any> {
  if (req.body) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: any) => { body += chunk; });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    const body = await getRequestBody(req);
    const { chapterId, title, content } = body;

    if (!title) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "title은 필수입니다." }));
    }

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const folderId = process.env.GOOGLE_DOCS_FOLDER_ID;

    if (!clientEmail || !privateKey) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        error: "서비스 계정 환경변수(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY)가 Vercel에 설정되지 않았습니다.",
      }));
    }

    // 서비스 계정 JWT 인증
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    const docs = google.docs({ version: "v1", auth });
    const drive = google.drive({ version: "v3", auth });

    // Google Doc 생성
    const doc = await docs.documents.create({
      requestBody: { title },
    });

    const documentId = doc.data.documentId!;

    // 본문 내용 삽입
    if (content && content.trim()) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }

    // 지정 폴더로 이동
    if (folderId) {
      const file = await drive.files.get({ fileId: documentId, fields: "parents" });
      const prevParents = (file.data.parents || []).join(",");
      await drive.files.update({
        fileId: documentId,
        addParents: folderId,
        removeParents: prevParents,
        fields: "id, parents",
      });
    }

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    const exportedAt = new Date().toISOString();

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      success: true,
      documentId,
      documentUrl,
      documentTitle: title,
      exportedAt,
    }));

  } catch (error: any) {
    console.error("Google Docs export error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message || "내보내기 중 오류가 발생했습니다." }));
  }
}
