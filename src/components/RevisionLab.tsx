import React, { useState } from "react";
import { Sparkles, ArrowLeft, Check, RotateCcw, PenTool, HelpCircle, Loader, RefreshCw, Layers } from "lucide-react";
import { Chapter } from "../types";

interface RevisionLabProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onUpdateChapterContent: (chapterId: string, content: string) => void;
}

export default function RevisionLab({
  chapters,
  selectedChapterId,
  onUpdateChapterContent,
}: RevisionLabProps) {
  // Local active chapter select
  const [activeChapterId, setActiveChapterId] = useState<string>(selectedChapterId || chapters[0]?.id || "");
  const [freeformText, setFreeformText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>("");

  // Result comparison states
  const [showResult, setShowResult] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [revisedText, setRevisedText] = useState("");
  const [reason, setReason] = useState("");

  const currentChapter = chapters.find(c => c.id === activeChapterId);

  // Determine actual text block to polish
  const getPolishTargetText = () => {
    if (activeChapterId === "freeform") {
      return freeformText;
    }
    return currentChapter?.content || "";
  };

  const handleRevisionCall = async (mode: string) => {
    const textToPolish = getPolishTargetText();
    if (!textToPolish.trim()) {
      alert("다듬기 작업을 하려면 먼저 본문에 글을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setCurrentMode(mode);
    setShowResult(false);

    try {
      const response = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToPolish,
          mode: mode,
          bookTitle: currentChapter ? "바다를 닮은 마음" : "자유 집필실",
          chapterTitle: currentChapter ? currentChapter.title : "테마 글귀"
        }),
      });

      if (!response.ok) {
        throw new Error("윤문 API 네트워크 응답이 불안정합니다.");
      }

      const data = await response.json();
      setOriginalText(data.originalText || textToPolish);
      setRevisedText(data.revisedText || "");
      setReason(data.reason || "바다 윤문 가공이 완료되었습니다.");
      setShowResult(true);
    } catch (err: any) {
      console.error(err);
      alert("윤문 작업에 에러가 발생했습니다: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyRevision = () => {
    if (activeChapterId !== "freeform" && currentChapter) {
      onUpdateChapterContent(currentChapter.id, revisedText);
      alert("다듬어진 문장들을 현재 원고에 정갈하게 적용하였습니다.");
    } else {
      setFreeformText(revisedText);
      alert("자유 집필실 입력란에 새로운 추천 문장을 반사시켰습니다.");
    }
    setShowResult(false);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="revision-lab-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#182A4D] flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            <span>원고 다듬기 연구소</span>
          </h2>
          <p className="text-xs text-slate-400">작가의 고유한 체취와 어망을 흩뜨리지 않으며 격조 있게 언어를 가공해 드립니다.</p>
        </div>

        {/* Source Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <select
            value={activeChapterId}
            onChange={(e) => {
              setActiveChapterId(e.target.value);
              setShowResult(false);
            }}
            className="bg-white border-none py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-cyan-200"
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>📖 {c.title}</option>
            ))}
            <option value="freeform">✍ 자유 윤문 샌드박스</option>
          </select>
        </div>
      </div>

      {/* Editor Box or Freeform Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-50 pb-2">
              <span className="font-semibold text-slate-600 block">윤색할 원고 본문</span>
              <span>{(activeChapterId === "freeform" ? freeformText : currentChapter?.content || "").length}자</span>
            </div>

            {activeChapterId === "freeform" ? (
              <textarea
                value={freeformText}
                onChange={(e) => setFreeformText(e.target.value)}
                placeholder="여기에 생각 중인 임시 문구나 다듬고 싶은 아무 한 구절을 올려 마음껏 가다듬어 보세요..."
                className="w-full h-72 bg-slate-50/50 p-4 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              />
            ) : (
              <div className="w-full h-72 bg-slate-50/30 p-4 rounded-2xl text-xs sm:text-sm font-sans leading-loose text-slate-600 border border-slate-150 overflow-y-auto select-text">
                {currentChapter?.content ? (
                  currentChapter.content
                ) : (
                  <p className="text-slate-300 italic text-center pt-24 text-xs">
                    본문이 비어있습니다. 이 챕터에 원고를 작성 후 다듬기를 시행해 보세요.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Core Tools Triggers Panel */}
          <div className="bg-[#BFEDEB]/30 p-6 rounded-3xl border border-[#BFEDEB] shadow-sm">
            <h4 className="text-xs font-bold text-[#182A4D] mb-4 uppercase tracking-widest flex items-center space-x-1.5">
              <span>● 작가의 다듬기 도구 세트</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleRevisionCall("spellcheck")}
                disabled={loading}
                className="p-3 text-left bg-white hover:bg-[#182A4D] hover:text-white rounded-2xl border border-slate-200/60 shadow-sm transition group disabled:opacity-50"
              >
                <div className="text-xs font-bold block mb-1 text-slate-800 group-hover:text-cyan-200 transition">맞춤법/띄어쓰기</div>
                <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition">기본적인 문법 교정</div>
              </button>

              <button
                onClick={() => handleRevisionCall("natural")}
                disabled={loading}
                className="p-3 text-left bg-white hover:bg-[#182A4D] hover:text-white rounded-2xl border border-slate-200/60 shadow-sm transition group disabled:opacity-50"
              >
                <div className="text-xs font-bold block mb-1 text-slate-800 group-hover:text-cyan-200 transition">문장 자연스럽게</div>
                <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition">유려한 한국어 구어 표현</div>
              </button>

              <button
                onClick={() => handleRevisionCall("emotional")}
                disabled={loading}
                className="p-3 text-left bg-white hover:bg-[#182A4D] hover:text-white rounded-2xl border border-slate-200/60 shadow-sm transition group disabled:opacity-50"
              >
                <div className="text-xs font-bold block mb-1 text-slate-800 group-hover:text-cyan-200 transition">작가 고유 문체 윤색</div>
                <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition">차분하고 은은한 미광</div>
              </button>

              <button
                onClick={() => handleRevisionCall("literary")}
                disabled={loading}
                className="p-3 text-left bg-white hover:bg-[#182A4D] hover:text-white rounded-2xl border border-slate-200/60 shadow-sm transition group disabled:opacity-50"
              >
                <div className="text-xs font-bold block mb-1 text-slate-800 group-hover:text-cyan-200 transition">더 문학적/조형적</div>
                <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition">시적 은유와 상상력 수놓기</div>
              </button>

              <button
                onClick={() => handleRevisionCall("concise")}
                disabled={loading}
                className="p-3 text-left bg-white hover:bg-[#182A4D] hover:text-white rounded-2xl border border-slate-200/60 shadow-sm transition group disabled:opacity-50"
              >
                <div className="text-xs font-bold block mb-1 text-slate-800 group-hover:text-cyan-200 transition">단정하고 명료하게</div>
                <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition">늘어지는 군더더기 말 축소</div>
              </button>

              <button
                onClick={() => handleRevisionCall("flow")}
                disabled={loading}
                className="p-3 text-left bg-white hover:bg-[#182A4D] hover:text-white rounded-2xl border border-slate-200/60 shadow-sm transition group disabled:opacity-50"
              >
                <div className="text-xs font-bold block mb-1 text-slate-800 group-hover:text-cyan-200 transition">문단 정밀 진단</div>
                <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition">상하맥락 흐름과 일치 지적</div>
              </button>

              <button
                onClick={() => handleRevisionCall("repetition")}
                disabled={loading}
                className="p-3 text-left bg-white hover:bg-[#182A4D] hover:text-white rounded-2xl border border-slate-200/60 shadow-sm transition group disabled:opacity-50"
              >
                <div className="text-xs font-bold block mb-1 text-slate-800 group-hover:text-cyan-200 transition">동어 반복 정리</div>
                <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition">조사와 꼬리 어휘 정교화</div>
              </button>

              <button
                onClick={() => handleRevisionCall("title")}
                disabled={loading}
                className="p-3 text-left bg-white hover:bg-[#182A4D] hover:text-white rounded-2xl border border-slate-200/60 shadow-sm transition group disabled:opacity-50"
              >
                <div className="text-xs font-bold block mb-1 text-slate-800 group-hover:text-cyan-200 transition">시적 제목 추천</div>
                <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition">테마에 맞는 3개 이름 추천</div>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic comparative output container */}
        <article className="lg:col-span-1 space-y-4">
          {loading && (
            <div className="bg-white rounded-3xl p-8 border border-cyan-100 shadow-sm h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <Loader className="w-8 h-8 text-[#182A4D] animate-spin" />
              <div>
                <p className="text-xs font-bold text-[#182A4D]">서선 정밀 어루만지기 시행 중</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  물결처럼 고요하게 문장을 정제하여 파도의 깊은 사유를 불어넣는 단계입니다...
                </p>
              </div>
            </div>
          )}

          {!loading && !showResult && (
            <div className="bg-amber-50/20 rounded-3xl p-8 border border-dashed border-cyan-100 h-full flex flex-col items-center justify-center text-center space-y-3 min-h-[400px]">
              <HelpCircle className="w-8 h-8 text-cyan-300" />
              <div>
                <h5 className="text-xs font-bold text-slate-700">작업 대기 중</h5>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                  좌측 기획 도구 상자의 필터를 누르시면, 문장 교정 및 대조 목록 창이 활성화됩니다.
                </p>
              </div>
            </div>
          )}

          {!loading && showResult && (
            <div className="bg-white rounded-3xl p-5 border border-cyan-150 shadow-sm space-y-4 animate-fade-in text-xs min-h-[400px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="font-bold text-teal-800 uppercase tracking-widest text-[10px] flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    <span>윤쇄 제안서 도착</span>
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded font-mono uppercase">
                    {currentMode}
                  </span>
                </div>

                {/* Compare segments layout */}
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">작가 원본</span>
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-500 italic line-clamp-4 leading-relaxed">
                      {originalText}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-cyan-700 block uppercase">편집자 추천제안</span>
                    <p className="p-3 bg-cyan-50/50 rounded-xl text-slate-800 font-medium leading-relaxed">
                      {revisedText}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#D6B46A] block uppercase">가공 설명</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans bg-amber-50/30 p-2.5 rounded-xl border border-amber-100/50">
                      {reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action approvals */}
              <div className="flex items-center space-x-2 pt-4 border-t border-slate-50">
                <button
                  onClick={() => handleRevisionCall(currentMode)}
                  className="flex-1 py-2 text-slate-600 hover:text-slate-800 font-semibold border border-slate-200 hover:bg-slate-50 rounded-xl text-[11px] flex items-center justify-center space-x-1 transition"
                  title="다시 제안 요청"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>재요청</span>
                </button>

                <button
                  onClick={applyRevision}
                  className="flex-1.5 py-2 bg-[#182A4D] hover:bg-slate-800 text-white font-semibold rounded-xl text-[11px] flex items-center justify-center space-x-1 transition shadow-sm"
                  title="원고에 덮어씌움"
                >
                  <Check className="w-4 h-4 text-cyan-200" />
                  <span>제안문 적용</span>
                </button>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
