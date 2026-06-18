import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Save, Eye, EyeOff, Sparkles, FileText, CheckCircle, Clock, FileDown, Edit3 } from "lucide-react";
import { Chapter, BookProject } from "../types";

interface WritingEditorProps {
  projects: BookProject[];
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onUpdateChapterContent: (chapterId: string, content: string, note?: string) => void;
  onExportToGDocs: (chapterId: string) => void;
  onViewChange: (view: string) => void;
}

export default function WritingEditor({
  projects,
  chapters,
  selectedChapterId,
  onSelectChapter,
  onUpdateChapterContent,
  onExportToGDocs,
  onViewChange,
}: WritingEditorProps) {
  const currentChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];

  const [editorContent, setEditorContent] = useState("");
  const [chapterNote, setChapterNote] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"clean" | "typing" | "saved">("clean");

  // Keep a ref to run auto-saves when typing pauses
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state with selected chapter
  useEffect(() => {
    if (currentChapter) {
      setEditorContent(currentChapter.content || "");
      setChapterNote(currentChapter.note || "");
      setSaveStatus("clean");
    }
  }, [selectedChapterId, currentChapter?.id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditorContent(val);
    setSaveStatus("typing");

    // Clear previous save timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Trigger auto-save 1.2s after user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      onUpdateChapterContent(currentChapter.id, val, chapterNote);
      setSaveStatus("saved");
    }, 1200);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setChapterNote(val);
    setSaveStatus("typing");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onUpdateChapterContent(currentChapter.id, editorContent, val);
      setSaveStatus("saved");
    }, 1200);
  };

  const triggerManualSave = () => {
    if (currentChapter) {
      onUpdateChapterContent(currentChapter.id, editorContent, chapterNote);
      setSaveStatus("saved");
    }
  };

  // Perform clean-up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Compute textual metrics
  const wordCount = editorContent.trim().length;
  const paragraphCount = editorContent.trim() ? editorContent.split(/\n+/).filter(Boolean).length : 0;
  const todayGoal = 1000;
  const todayProgressPercent = Math.min(100, Math.round((wordCount / todayGoal) * 100));

  const activeBook = projects.find((p) => p.id === currentChapter?.bookId) || projects[0];

  return (
    <div className={`grid grid-cols-1 ${focusMode ? "" : "lg:grid-cols-4"} gap-6 transition-all duration-300`} id="writing-editor-workspace">
      {/* 1. Left selection rail (collapses completely inside Zen Focus Mode) */}
      {!focusMode && (
        <aside className="lg:col-span-1 bg-white p-5 rounded-2xl border border-[#182A4D]/5 shadow-sm space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="border-b border-[#182A4D]/5 pb-3 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#86D7E8]" />
            <h4 className="text-xs font-bold text-[#182A4D] uppercase tracking-wider">프로젝트 목차</h4>
          </div>

          <div className="space-y-1.5">
            {chapters.map((chap) => (
              <button
                key={chap.id}
                onClick={() => onSelectChapter(chap.id)}
                className={`w-full text-left p-3 rounded-lg transition text-xs font-medium flex items-center justify-between border ${
                  chap.id === currentChapter?.id
                    ? "bg-[#86D7E8]/10 text-[#182A4D] font-bold border-[#86D7E8]/30"
                    : "bg-white text-slate-500 border-transparent hover:bg-[#F8F5EF] hover:text-[#182A4D]"
                }`}
              >
                <span className="truncate pr-2">{chap.title}</span>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                  {chap.wordCount.toLocaleString()}자
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* 2. Central Editor Canvas (occupies 3/4 or fully depending on Zen layout mode) */}
      <div className={`${focusMode ? "lg:col-span-4" : "lg:col-span-3"} flex flex-col space-y-4 max-w-4xl mx-auto w-full transition-all duration-300`}>
        {/* Editor Controls Bar */}
        <div className="bg-white/80 p-3.5 px-6 rounded-2xl border border-[#182A4D]/5 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all border ${
                focusMode
                  ? "bg-[#BFEDEB] text-[#182A4D] border-[#182A4D]/10"
                  : "bg-white text-slate-600 border-[#182A4D]/10 hover:bg-[#F8F5EF]"
              }`}
              title={focusMode ? "집중 모드 해제" : "집중 모드 활성화 (메뉴 숨김)"}
            >
              {focusMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#182A4D]" />
                  <span>일반 보기</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>집중 모드</span>
                </>
              )}
            </button>

            {/* Quick Link into Revisions */}
            <button
              onClick={() => onViewChange("revisions")}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#182A4D] bg-[#86D7E8]/10 border border-[#86D7E8]/20 hover:bg-[#86D7E8]/20 transition-all"
              title="원고 다듬기 연구소로 이동"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#182A4D]/70" />
              <span>교정하기</span>
            </button>
          </div>

          {/* Automations status */}
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {saveStatus === "typing" && (
              <span className="flex items-center space-x-1.5 text-slate-500 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>기록 중...</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center space-x-1.5 text-teal-600">
                <CheckCircle className="w-3 h-3 text-teal-500" />
                <span>자동 저장됨</span>
              </span>
            )}
            {saveStatus === "clean" && (
              <span className="flex items-center space-x-1.5 text-slate-400">
                <Clock className="w-3 h-3 text-slate-300" />
                <span>동기화 완료</span>
              </span>
            )}

            <button
              onClick={triggerManualSave}
              className="p-1 px-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-[#182A4D]/10 transition-all text-[#182A4D]"
              title="수동 저장"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Paper Canvas */}
        <div 
          className={`flex-1 rounded-3xl p-8 md:p-12 shadow-sm border transition-all duration-500 ${
            focusMode 
              ? "bg-[#F8F5EF] border-[#182A4D]/10 text-[#182A4D]" 
              : "bg-white border-[#182A4D]/5 text-[#182A4D]"
          }`}
          style={{ minHeight: "550px" }}
        >
          {/* Breadcrumb line inside essay */}
          <div className="border-b border-dashed border-[#182A4D]/10 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#D6B46A] tracking-widest">{activeBook?.title}</p>
              <h2 className="text-xl font-serif font-bold text-[#182A4D] mt-0.5">{currentChapter?.title}</h2>
            </div>

            {/* Quick Export Button */}
            <button
              onClick={() => onExportToGDocs(currentChapter.id)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold border text-[#182A4D] bg-[#BFEDEB] border-[#182A4D]/10 hover:bg-[#86D7E8]/40 transition-all ml-auto md:ml-0"
              title="현 챕터 Google Docs로 무제한 전송"
            >
              <FileDown className="w-3.5 h-3.5 text-[#182A4D]/70" />
              <span>Docs로 내보내기</span>
            </button>
          </div>

          {/* Beautiful and spacious Writer workspace */}
          <textarea
            value={editorContent}
            onChange={handleTextChange}
            placeholder="바다의 깊이를 사모하듯, 조용하게 마음속 단어들을 흘려보내 보세요..."
            className="w-full h-[380px] bg-transparent border-none outline-none resize-none overflow-y-auto leading-loose text-base md:text-lg font-serif tracking-wide text-slate-800 placeholder-slate-300 focus:ring-0"
            style={{ minHeight: "380px" }}
          />

          {/* Sub-notepad inside editor bottom */}
          <div className="mt-6 pt-5 border-t border-[#182A4D]/5 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#D6B46A] tracking-widest uppercase flex items-center space-x-1">
              <Edit3 className="w-3 h-3 text-amber-500" />
              <span>이 챕터의 작가용 메모</span>
            </span>
            <input
              type="text"
              placeholder="예: 챕터의 목적, 흐름 기조, 영감을 준 인용구 등 기록"
              value={chapterNote}
              onChange={handleNoteChange}
              className="w-full bg-[#F8F5EF]/60 px-3.5 py-2 rounded-lg text-xs text-slate-600 placeholder-slate-400 border border-transparent focus:border-[#182A4D]/10 focus:outline-none focus:bg-white transition"
            />
          </div>
        </div>

        {/* Dynamic footer status bar */}
        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-4 text-slate-500">
            <span className="flex items-center space-x-1 font-mono">
              <FileText className="w-4 h-4 text-slate-300" />
              <strong>{wordCount.toLocaleString()}</strong>
              <span>자 작성</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden md:inline" />
            <span className="md:flex items-center space-x-1 font-mono hidden">
              <span>단락 수:</span>
              <strong>{paragraphCount}</strong>
              <span>개</span>
            </span>
          </div>

          {/* Today target goals mapping meter */}
          <div className="flex items-center space-x-3 flex-1 max-w-xs justify-end w-full">
            <div className="text-[11px] text-slate-400 font-medium">오늘 작성량: {wordCount.toLocaleString()}자 / {todayGoal}자</div>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
              <div 
                className="h-full bg-[#182A4D] rounded-full transition-all duration-300" 
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>
            <span className="text-[10px] bg-sky-50 text-sky-800 font-semibold py-0.5 px-1.5 rounded">
              {todayProgressPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
