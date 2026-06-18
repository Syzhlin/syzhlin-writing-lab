export type ProjectStatus = '기획 중' | '초안 작성 중' | '수정 중' | '퇴고 중' | '완성';
export type ChapterStatus = '작성 전' | '초안 작성 중' | '작성 완료';

export interface BookProject {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: ProjectStatus;
  targetWordCount: number;
  currentWordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  order: number;
  summary: string;
  content: string;
  status: ChapterStatus;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export interface Revision {
  id: string;
  chapterId: string;
  originalText: string;
  revisedText: string;
  reason: string;
  type: string; // 'spellcheck' | 'natural' | 'emotional' | 'literary' | 'concise' | 'repetition' | 'flow'
  createdAt: string;
}

export interface ExportLog {
  id: string;
  bookId: string;
  chapterId: string;
  provider: 'google_docs';
  documentTitle: string;
  documentUrl: string;
  exportedAt: string;
}

// Initial Beautiful Mock Data matching user context
export const INITIAL_PROJECTS: BookProject[] = [
  {
    id: "proj-1",
    title: "나는 바다를 닮은 마음으로 산다",
    subtitle: "언제나 한결같은 호흡과 묵묵하게 빛나는 푸른 위로",
    description: "잔잔하게 밀려드는 물결처럼 우리의 상처받은 감정선과 마주하고, 바다가 품은 무한한 포용력과 그 덤덤함을 아우르며 한 장 한 장 써내려가는 감성에세이집.",
    status: "초안 작성 중",
    targetWordCount: 80000,
    currentWordCount: 12430,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-18T15:24:00.000Z"
  }
];

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: "chap-1",
    bookId: "proj-1",
    title: "Chapter 1. 프롤로그",
    order: 1,
    summary: "바다가 주는 차분한 위로와 조용한 집필실에서의 첫 결심을 고백하는 머리말.",
    content: "바닷가 앞의 조그마한 하얗고 정갈한 서상 위에 펜을 올려놓는다. 저 수평선은 끝이 대칭인 것처럼 보여도 매 순간 자잘한 물거품을 깨트리며 일렁인다. 우리의 마음도 이와 같지 않을까. 무너지지 않은 척 꼿꼿하게 서 있어도, 밑바닥에서는 수십 마리의 외로운 물고기가 헤엄친다. 이 책은 흘러넘치는 슬픔과 부서져 내린 고독을 수습하고, 심해처럼 깊지만 솜털처럼 따스하게 받아낼 바다를 꿈꾸는 정성 어린 기록이다.",
    status: "작성 완료",
    wordCount: 240,
    createdAt: "2026-06-02T09:00:00.000Z",
    updatedAt: "2026-06-05T12:00:00.000Z",
    note: "너무 감상적이지 않게, 차분함과 담담함 사이의 균형을 맞추기."
  },
  {
    id: "chap-2",
    bookId: "proj-1",
    title: "Chapter 2. 내가 바다를 좋아하는 이유",
    order: 2,
    summary: "언제나 묵묵하게 흘러온 파도가 내 마음에 수혈하는 생동감에 대하여.",
    content: "바다는 결코 말이 없다. 하지만 언제나 가득 차 있는 그 묵묵함이 소음으로 가득 찬 시가지를 한 번에 씻어내린다. 나는 일이 막힐 때마다 수평선 아래의 숨겨진 바위들을 본다. 물결 속에 이끼를 머금고 수없이 씻기면서도 절대로 흩어지지 않는 바위들. 그 바위들처럼 이리저리 치이면서도 자신의 고유한 색채와 모서리를 유지하며 버티는 마음을 배우고 싶어서 나는 바다를 찾는다.",
    status: "초안 작성 중",
    wordCount: 10030,
    createdAt: "2026-06-06T14:00:00.000Z",
    updatedAt: "2026-06-18T15:24:00.000Z",
    note: "인사동 바다 느낌보다는 조금 더 청명하고 외딴 무인도의 동해 바다 심상을 끌어올 것."
  },
  {
    id: "chap-3",
    bookId: "proj-1",
    title: "Chapter 3. 무너진 날의 언어",
    order: 3,
    summary: "더는 말할 힘조차 없는 날, 모래사장에 파도가 새기고 간 자국들을 따라 읽기.",
    content: "",
    status: "작성 전",
    wordCount: 0,
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-06-10T10:00:00.000Z",
    note: "가장 절망스러웠을 때 썼던 낙서장 뭉텅이를 가져와 조심스럽게 풀어헤칠 것."
  },
  {
    id: "chap-4",
    bookId: "proj-1",
    title: "Chapter 4. 다시 쓰는 마음",
    order: 4,
    summary: "한 자씩 수습하고, 문장을 윤쇄해가며 한 땀 한 땀 영혼을 고체화하기.",
    content: "",
    status: "작성 전",
    wordCount: 0,
    createdAt: "2026-06-12T11:00:00.000Z",
    updatedAt: "2026-06-12T11:00:00.000Z"
  },
  {
    id: "chap-5",
    bookId: "proj-1",
    title: "Chapter 5. 에필로그",
    order: 5,
    summary: "나만의 바다 집필실의 문을 닫으며, 나의 이야기를 안아준 모든 작가적 여정에게 경의를.",
    content: "",
    status: "작성 전",
    wordCount: 0,
    createdAt: "2026-06-15T15:00:00.000Z",
    updatedAt: "2026-06-15T15:00:00.000Z"
  }
];

export const INITIAL_EXPORTS: ExportLog[] = [
  {
    id: "exp-1",
    bookId: "proj-1",
    chapterId: "chap-1",
    provider: "google_docs",
    documentTitle: "260605_나는바다를닮은마음으로산다_Chapter1",
    documentUrl: "https://docs.google.com/document/d/mock-id-1",
    exportedAt: "2026-06-05T12:05:00.000Z"
  }
];
