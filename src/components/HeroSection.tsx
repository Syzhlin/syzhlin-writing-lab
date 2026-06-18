import React, { useState, useEffect } from "react";
import { 
  PenTool, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Archive, 
  ArrowRight, 
  Map, 
  Compass, 
  CheckCircle, 
  ExternalLink,
  Sunset,
  BookMarked
} from "lucide-react";
import { BookProject, Chapter, ExportLog } from "../types";

interface HeroSectionProps {
  projects: BookProject[];
  chapters: Chapter[];
  exportLogs: ExportLog[];
  gdocsLinked: boolean;
  onActionClick: (action: "write-today" | "continue" | "polish") => void;
  onViewChange: (view: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onExportToGDocs: (chapterId: string) => void;
}

export default function HeroSection({
  projects,
  chapters,
  exportLogs,
  gdocsLinked,
  onActionClick,
  onViewChange,
  onSelectChapter,
  onExportToGDocs,
}: HeroSectionProps) {
  // Local state for today's writing temperature (emotion record)
  const [selectedTemp, setSelectedTemp] = useState<string>(() => {
    return localStorage.getItem("syzhlin_today_temp") || "";
  });

  const handleSelectTemp = (temp: string) => {
    const newVal = selectedTemp === temp ? "" : temp;
    setSelectedTemp(newVal);
    if (newVal) {
      localStorage.setItem("syzhlin_today_temp", newVal);
    } else {
      localStorage.removeItem("syzhlin_today_temp");
    }
  };

  // Format current date in Korean
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: "numeric", 
      month: "long", 
      day: "numeric", 
      weekday: "short" 
    };
    return new Date().toLocaleDateString("ko-KR", options);
  };

  const activeProj = projects[0] || { title: "나는 바다를 닮은 마음으로 산다", targetWordCount: 80000, currentWordCount: 10030 };
  
  // Find primary chapters for display (Chapter 1 & Chapter 2 as specified in the wireframe)
  const chap1 = chapters.find(c => c.id === "chap-1") || chapters[0];
  const chap2 = chapters.find(c => c.id === "chap-2") || chapters[1] || chapters[0];

  const lastSavedTimeText = "오후 3:24";

  // Google Docs export status resolver
  const getGDocsStatus = (chapterId: string) => {
    const logs = exportLogs.filter(log => log.chapterId === chapterId);
    if (logs.length > 0) {
      const latest = logs[0];
      // format date
      const d = new Date(latest.exportedAt);
      const hours = d.getHours();
      const mins = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? "오후" : "오전";
      const displayHours = hours % 12 || 12;
      return {
        exported: true,
        text: `Docs 저장 완료 · 오늘 ${ampm} ${displayHours}:${mins}`,
        url: latest.documentUrl,
        title: latest.documentTitle
      };
    }
    return {
      exported: false,
      text: "아직 Docs로 내보내지 않았어요.",
      url: "",
      title: ""
    };
  };

  return (
    <div className="space-y-16 animate-fade-in" id="hero-section">
      
      {/* 1. Header Area with Google Docs indicators */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#182A4D]/5 pb-5">
        <div>
          <h1 className="text-xl font-serif font-bold text-[#182A4D] tracking-tight">Syzhlin Writing Lab</h1>
          <p className="text-xs text-[#7D8798] mt-1 font-sans">바다 앞 작가의 조용한 집필실</p>
        </div>
        <div className="flex items-center space-x-3 mt-3 md:mt-0 bg-[#EAF6F5] px-3.5 py-1.5 rounded-full border border-[#86D7E8]/20 shadow-[0_1px_4px_rgba(24,42,77,0.01)]">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${gdocsLinked ? 'bg-teal-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${gdocsLinked ? 'bg-teal-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-[11px] font-sans font-medium text-[#182A4D]">
            {gdocsLinked ? "Docs 연결됨" : "Docs 연결 보류"}
          </span>
        </div>
      </header>

      {/* 2. Hero Box Container & Bottom Metadata Line */}
      <section className="space-y-4">
        {/* Main Hero Card - 오늘의 원고 (Highly customized, compact, almost white aqua) */}
        <div className="bg-gradient-to-br from-[#F2F9F8] to-[#EAF6F5] rounded-3xl p-6 md:p-8 border border-[#86D7E8]/20 flex flex-col justify-between relative overflow-hidden shadow-[0_2px_12px_rgba(24,42,77,0.015)] min-h-[340px]">
          
          <div className="relative z-10 space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#182A4D]/50 uppercase tracking-widest font-sans block">
                {formatDate()}
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#182A4D] tracking-tight">
                오늘의 원고
              </h2>
            </div>
            
            <p className="text-[#182A4D]/75 text-[13px] md:text-sm leading-relaxed max-w-xl font-serif">
              오늘의 문장을 바다 앞 책상에 남겨보세요. <br />
              한 문장씩 쌓아 한 권의 책을 완성합니다.
            </p>
            
            {/* Action Cards (Compacted height by 30-40%, beautiful card trigger interfaces) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 max-w-[760px]">
              
              {/* Card 1: 오늘 쓰기 (Primary Indigo Card) */}
              <button
                onClick={() => onActionClick("write-today")}
                className="group text-left p-4.5 bg-[#182A4D] hover:bg-[#20365F] text-white rounded-2xl flex flex-col justify-between min-h-[108px] md:min-h-[116px] h-full border border-transparent shadow-[0_4px_12px_rgba(24,42,77,0.06)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
              >
                <div className="flex items-center space-x-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#BFEDEB] group-hover:scale-110 transition-transform duration-150" />
                  <span className="text-xs font-bold font-sans tracking-tight">오늘 쓰기</span>
                </div>
                <p className="text-[10px] text-teal-200/80 leading-relaxed font-sans font-normal mt-3.5">
                  오늘의 원고에 새 문장을 더해요.
                </p>
              </button>

              {/* Card 2: 이어 쓰기 (Secondary Cozy Slate-Border Card) */}
              <button
                onClick={() => onActionClick("continue")}
                className="group text-left p-4.5 bg-white hover:bg-[#FCFAF7] text-[#182A4D] rounded-2xl border border-[#182A4D]/10 flex flex-col justify-between min-h-[108px] md:min-h-[116px] h-full shadow-[0_2px_8px_rgba(24,42,77,0.01)] hover:-translate-y-0.5 active:translate-y-0 hover:border-[#86D7E8]/40 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
              >
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#7D8798] group-hover:rotate-12 transition-transform duration-150" />
                  <span className="text-xs font-bold font-sans tracking-tight">이어 쓰기</span>
                </div>
                <p className="text-[10px] text-[#7D8798] leading-relaxed font-sans font-normal mt-3.5">
                  마지막으로 멈춘 문장으로 돌아가요.
                </p>
              </button>

              {/* Card 3: 다듬기 (Secondary Cozy Slate-Border Card) */}
              <button
                onClick={() => onActionClick("polish")}
                className="group text-left p-4.5 bg-white/70 hover:bg-[#FCFAF7] text-[#182A4D] rounded-2xl border border-[#182A4D]/10 flex flex-col justify-between min-h-[108px] md:min-h-[116px] h-full shadow-[0_2px_8px_rgba(24,42,77,0.01)] hover:-translate-y-0.5 active:translate-y-0 hover:border-[#86D7E8]/40 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
              >
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600/80 group-hover:scale-110 transition-transform duration-150" />
                  <span className="text-xs font-bold font-sans tracking-tight">다듬기</span>
                </div>
                <p className="text-[10px] text-[#7D8798] leading-relaxed font-sans font-normal mt-3.5">
                  원문을 지키며 문장을 정리해요.
                </p>
              </button>
            </div>
          </div>

          {/* Accent decoration ambient soft circle blur */}
          <div className="absolute -right-24 -bottom-24 w-52 h-52 bg-[#86D7E8]/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 3. Hero Bottom: Clean, compact one-line status bar */}
        <div className="bg-[#FCFAF7] px-5 py-3 rounded-xl border border-[#182A4D]/5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#182A4D]/80 font-sans shadow-[0_1px_4px_rgba(24,42,77,0.005)]">
          <div className="flex items-center space-x-2.5">
            <span className="font-medium">✨ 오늘의 상태:</span>
            <span className="text-[#182A4D] font-bold">오늘 1,248자</span>
            <span className="text-slate-300">•</span>
            <span className="text-teal-600 font-semibold">목표까지 252자</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#7D8798]">{lastSavedTimeText} 저장</span>
          </div>
          {selectedTemp && (
            <div className="flex items-center space-x-1">
              <span className="text-[10px] bg-[#EAF6F5] text-teal-800 px-2 py-0.5 rounded font-medium">
                오늘의 작가 온도: {selectedTemp}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Grid wrapper for Today's Log + Temperature Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Right Info Panel - 오늘의 집필 기록 (Now clearly structured to represent details as requested) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#182A4D]/5 shadow-[0_2px_12px_rgba(24,42,77,0.01)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#182A4D]/5 pb-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#182A4D] tracking-tight">오늘의 집필 기록</h3>
              <p className="text-[10px] text-[#7D8798] font-sans mt-0.5">오늘도 원고가 조금 자랐어요.</p>
            </div>
            <span className="mt-2 md:mt-0 text-[9px] bg-[#EAF6F5] text-teal-800 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-widest font-sans self-start">
              Today Analytics
            </span>
          </div>

          {/* 4 small status cards inside "Today's Writing Record" as requested */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#FCFAF7] p-3 rounded-xl border border-[#182A4D]/5 flex flex-col justify-between">
              <span className="text-[9px] text-[#7D8798] font-bold block uppercase tracking-wider mb-1">오늘 작성량</span>
              <span className="text-sm font-serif font-bold text-[#182A4D]">1,248자</span>
            </div>
            <div className="bg-[#FCFAF7] p-3 rounded-xl border border-[#182A4D]/5 flex flex-col justify-between">
              <span className="text-[9px] text-[#7D8798] font-bold block uppercase tracking-wider mb-1">오늘 목표 달성</span>
              <span className="text-sm font-serif font-bold text-teal-600">83%</span>
            </div>
            <div className="bg-[#FCFAF7] p-3 rounded-xl border border-[#182A4D]/5 flex flex-col justify-between">
              <span className="text-[9px] text-[#7D8798] font-bold block uppercase tracking-wider mb-1">진행 챕터</span>
              <span className="text-xs font-serif font-bold text-[#182A4D] truncate" title={chap2 ? chap2.title : "Chapter 2"}>
                {chap2 ? chap2.title.split(".")[0] : "Chapter 2"}
              </span>
            </div>
            <div className="bg-[#FCFAF7] p-3 rounded-xl border border-[#182A4D]/5 flex flex-col justify-between">
              <span className="text-[9px] text-[#7D8798] font-bold block uppercase tracking-wider mb-1">마지막 저장</span>
              <span className="text-xs font-serif font-bold text-[#7D8798]">{lastSavedTimeText}</span>
            </div>
          </div>

          {/* Structured detailed list with exact request texts */}
          <div className="bg-[#FCFAF7]/50 rounded-2xl p-5 border border-[#182A4D]/5 space-y-4">
            <h4 className="text-xs font-sans font-bold text-[#182A4D] tracking-wide border-b border-[#182A4D]/5 pb-1">집필실 정밀 분석 리포트</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-700">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#7D8798]">오늘 작성량:</span>
                  <span className="font-bold text-[#182A4D]">1,248자</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7D8798]">오늘 목표:</span>
                  <span className="font-medium text-[#182A4D]">1,500자</span>
                </div>
                <div className="flex items-center justify-between bg-teal-50/50 px-2 py-1 rounded">
                  <span className="text-teal-700 font-medium">✏️ 목표까지 잔여량:</span>
                  <span className="font-bold text-teal-800">252자 남았어요</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7D8798]">오늘 목표 달성률:</span>
                  <span className="font-bold text-teal-600">83%</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#7D8798]">책 전체 진행률:</span>
                  <span className="font-bold text-[#182A4D]">12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7D8798]">책 전체 목표:</span>
                  <span className="font-medium text-[#182A4D]">10,030 / 80,000자</span>
                </div>
                <div className="flex items-center justify-between truncate" title={chap2 ? chap2.title : ""}>
                  <span className="text-[#7D8798]">진행 중인 챕터:</span>
                  <span className="font-medium text-[#182A4D] truncate max-w-[150px]">
                    {chap2 ? chap2.title : "Chapter 2. 내가 바다를 좋아하는 이유"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7D8798]">현재 프로젝트:</span>
                  <span className="font-medium text-[#182A4D] truncate max-w-[150px]">{activeProj.title}</span>
                </div>
              </div>
            </div>

            {/* Cozy prose description reflecting split logs */}
            <div className="pt-3.5 border-t border-dashed border-[#182A4D]/10 text-xs text-slate-600 leading-relaxed space-y-1">
              <p>🎯 오늘 목표 1,500자 중 <strong className="text-[#182A4D]">1,248자</strong>를 썼어요.</p>
              <p>🌊 책 전체로는 80,000자 중 <strong className="text-[#182A4D]">10,030자</strong>를 묵묵히 쌓아가고 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 4. 오늘의 집필 온도 (Smaller, cozy emotional record drawer) */}
        <div className="bg-white rounded-3xl p-6 border border-[#182A4D]/5 shadow-[0_2px_12px_rgba(24,42,77,0.01)] flex flex-col justify-between min-h-[290px]">
          <div className="space-y-4">
            <div className="border-b border-[#182A4D]/5 pb-3">
              <h3 className="text-sm font-serif font-bold text-[#182A4D] tracking-tight">오늘의 집필 온도</h3>
              <p className="text-[10px] text-[#7D8798] font-sans mt-0.5">오늘 원고는 어떤 마음으로 쓰였나요?</p>
            </div>

            <p className="text-xs text-[#7D8798] leading-relaxed font-sans">
              오늘의 문장에는 어떤 마음이 묻어 있나요?<br />
              오늘 쓴 문장을 마음의 온도로 기록해 보세요.
            </p>

            {/* Emotion Chips selector with beautiful mint-blue and navy hover/selected states */}
            <div className="flex flex-wrap gap-2 pt-2">
              {["고요함", "그리움", "용기", "막막함", "다시 시작"].map((mood) => {
                const isSelected = selectedTemp === mood;
                return (
                  <button
                    key={mood}
                    onClick={() => handleSelectTemp(mood)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-teal-400 ${
                      isSelected 
                        ? "bg-[#182A4D] text-white font-medium shadow-[0_2px_6px_rgba(24,42,77,0.15)]" 
                        : "bg-[#EAF6F5] hover:bg-[#D4EFEB] text-[#182A4D] border border-transparent"
                    }`}
                  >
                    {mood === "고요함" && "🧘 "}
                    {mood === "그리움" && "🌊 "}
                    {mood === "용기" && "☀️ "}
                    {mood === "막막함" && "🌫️ "}
                    {mood === "다시 시작" && "🌱 "}
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-[#182A4D]/10 text-[10px] text-[#7D8798] font-sans leading-relaxed">
            🌿 남겨진 온도는 한 권의 에세이가 끝날 무렵 작가님의 마음 흐름도가 됩니다.
          </div>
        </div>
      </section>

      {/* 5. 최근 원고 섹션 (Cleaned up 2 latest manuscript cards with rich, poetic layout) */}
      <section className="space-y-6" id="section-quick-drafts">
        <div className="flex items-center justify-between border-b border-[#182A4D]/5 pb-3">
          <div>
            <h3 className="text-base font-serif font-bold tracking-tight text-[#182A4D]">최근 원고</h3>
            <p className="text-xs text-[#7D8798] font-sans mt-0.5">쓰다 멈춘 문장은 그대로 조용히 기다리고 있어요.</p>
          </div>
          <button
            onClick={() => onViewChange("projects")}
            className="text-xs text-[#182A4D] hover:text-[#254279] font-bold hover:underline flex items-center space-x-1 transition-all"
          >
            <span>전체 목차 보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recent Manuscript Card 1: Chapter 1 */}
          <div className="group bg-[#FCFAF7] hover:bg-white p-5 rounded-2xl border border-[#182A4D]/5 hover:border-[#86D7E8]/40 shadow-[0_2px_8px_rgba(24,42,77,0.01)] hover:shadow-[0_4px_16px_rgba(24,42,77,0.02)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Chapter Identity */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[9px] font-bold text-teal-800 bg-[#EAF6F5] px-2.5 py-0.5 rounded-md tracking-wider uppercase">
                  ✓ 작성 완료
                </span>
                <span className="text-[10px] text-[#7D8798] font-sans font-medium">
                  {chap1 ? chap1.wordCount.toLocaleString() : "240"}자 작성 완료
                </span>
              </div>
              
              <h4 className="text-sm font-serif font-bold text-[#182A4D] group-hover:text-teal-700 transition-colors">
                {chap1 ? chap1.title : "Chapter 1. 프롤로그"}
              </h4>
              
              {/* Poetic preview in serif font as requested */}
              <p className="text-xs text-slate-600 font-serif leading-relaxed line-clamp-3 italic bg-white/50 p-3 rounded-lg border border-[#182A4D]/5">
                "{chap1 ? chap1.content : "바닷가 앞의 조그마한 하얗고 정갈한 서상 위에 펜을 올려놓는다. 저 수평선은 끝이 대칭인 것처럼 보여도 매 순간 자잘한 물거품을 깨트리며 일렁인다. 우리의 마음도 이와 같지 않을까..."}"
              </p>
            </div>

            {/* Bottom Specs & Action Triggers with Docs statuses */}
            <div className="mt-5 pt-3.5 border-t border-dashed border-[#182A4D]/10 space-y-4">
              
              {/* Detailed Export status indicator */}
              <div className="flex items-center justify-between text-[10px] text-[#7D8798] font-sans">
                <span>마지막 수정: 오늘 {lastSavedTimeText}</span>
                <span className="text-teal-600 font-medium">
                  {chap1 ? getGDocsStatus(chap1.id).text : "Docs 저장 완료 · 오늘 오후 3:30"}
                </span>
              </div>

              {/* Action Buttons row (Compact) */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => {
                    if (chap1) {
                      onSelectChapter(chap1.id);
                      onViewChange("editor");
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#F2FAF9] text-[#182A4D] border border-[#182A4D]/10 rounded-lg text-[10px] font-sans font-medium transition-all"
                >
                  다시 읽기
                </button>
                <button
                  onClick={() => {
                    if (chap1) {
                      onSelectChapter(chap1.id);
                      onViewChange("revisions");
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#F2FAF9] text-[#182A4D] border border-[#182A4D]/10 rounded-lg text-[10px] font-sans font-medium transition-all"
                >
                  문장 다듬기
                </button>
                
                {chap1 && getGDocsStatus(chap1.id).exported ? (
                  <a
                    href={getGDocsStatus(chap1.id).url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 bg-[#EAF6F5] hover:bg-[#DFF1EF] text-teal-800 rounded-lg text-[10px] font-sans font-bold transition-all flex items-center space-x-1"
                  >
                    <span>문서 열기</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => chap1 && onExportToGDocs(chap1.id)}
                    className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-850 rounded-lg text-[10px] font-sans font-medium transition-all"
                  >
                    Docs로 내보내기
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Manuscript Card 2: Chapter 2 (Highlighted Active Card) */}
          <div className="group bg-gradient-to-tr from-[#FCFAF7] to-white p-5 rounded-2xl border-l-[3.5px] border-l-teal-600 border-y-[#182A4D]/5 border-r-[#182A4D]/5 hover:border-[#86D7E8]/50 shadow-[0_2px_10px_rgba(24,42,77,0.015)] hover:shadow-[0_4px_20px_rgba(24,42,77,0.03)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Chapter Identity */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[9px] font-bold text-amber-800 bg-[#FFF9E6] px-2.5 py-0.5 rounded-md tracking-wider uppercase">
                  ✏️ 초안 작성 중
                </span>
                <span className="text-[10px] text-[#7D8798] font-sans font-medium">
                  {chap2 ? chap2.wordCount.toLocaleString() : "10,030"}자 작성 중
                </span>
              </div>
              
              <h4 className="text-sm font-serif font-bold text-[#182A4D] group-hover:text-teal-700 transition-colors">
                {chap2 ? chap2.title : "Chapter 2. 내가 바다를 좋아하는 이유"}
              </h4>
              
              {/* Content Preview */}
              <p className="text-xs text-slate-600 font-serif leading-relaxed line-clamp-3 italic bg-white/70 p-3 rounded-lg border border-[#182A4D]/5">
                "{chap2 ? chap2.content : "바다는 결코 말이 없다. 하지만 언제나 가득 차 있는 그 묵묵함이 소음으로 가득 찬 시가지를 한 번에 씻어내린다. 나는 일이 막힐 때마다 수평선 아래의 숨겨진 바위들을 본다..."}"
              </p>
            </div>

            {/* Bottom Specs & Actions */}
            <div className="mt-5 pt-3.5 border-t border-dashed border-[#182A4D]/10 space-y-4">
              
              <div className="flex items-center justify-between text-[10px] text-[#7D8798] font-sans">
                <span>마지막 수정: 오늘 {lastSavedTimeText}</span>
                <span className="text-amber-700 font-medium">
                  {chap2 ? getGDocsStatus(chap2.id).text : "아직 Docs로 내보내지 않았어요."}
                </span>
              </div>

              {/* Action Buttons row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => {
                    if (chap2) {
                      onSelectChapter(chap2.id);
                      onViewChange("editor");
                    }
                  }}
                  className="px-2.5 py-1.5 bg-[#182A4D] hover:bg-[#20365F] text-white rounded-lg text-[10px] font-sans font-bold shadow-sm transition-all flex items-center space-x-1"
                >
                  <span>바로 이어쓰기</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => {
                    if (chap2) {
                      onSelectChapter(chap2.id);
                      onViewChange("revisions");
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#F2FAF9] text-[#182A4D] border border-[#182A4D]/10 rounded-lg text-[10px] font-sans font-medium transition-all"
                >
                  문장 다듬기
                </button>
                
                {chap2 && getGDocsStatus(chap2.id).exported ? (
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={getGDocsStatus(chap2.id).url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-[#EAF6F5] hover:bg-[#DFF1EF] text-teal-800 rounded-lg text-[10px] font-sans font-bold transition-all flex items-center space-x-1"
                    >
                      <span>문서 열기</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <button
                      onClick={() => onExportToGDocs(chap2.id)}
                      className="px-2 py-1.5 text-slate-400 hover:text-[#182A4D] text-[9px] font-sans hover:underline transition-all"
                    >
                      다시 내보내기
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => chap2 && onExportToGDocs(chap2.id)}
                    className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-850 rounded-lg text-[10px] font-sans font-medium transition-all"
                  >
                    Docs로 내보내기
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. 작가의 작업실 / Main Gateways (Refined titles & subtitles as requested) */}
      <section className="space-y-6 pt-4" id="section-main-spaces">
        <div className="border-t border-[#182A4D]/10 pt-8">
          <h3 className="text-base font-serif font-bold text-[#182A4D] tracking-tight">작가의 작업실</h3>
          <p className="text-[10px] text-[#7D8798] font-bold uppercase tracking-widest mt-1">집필실 안의 네 개의 문</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: 책의 지도 (Book Map - projects) */}
          <div
            onClick={() => onViewChange("projects")}
            className="group cursor-pointer bg-white p-6 rounded-2xl border border-[#182A4D]/5 shadow-[0_2px_8px_rgba(24,42,77,0.01)] hover:shadow-[0_8px_20px_rgba(24,42,77,0.03)] hover:border-[#86D7E8]/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[155px]"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF6F5] flex items-center justify-center text-[#182A4D]">
                <Map className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[9px] text-[#D6B46A] tracking-wider font-bold block uppercase mb-0.5">MAP OF BOOK</span>
                <h4 className="text-xs font-serif font-bold text-[#182A4D] group-hover:text-cyan-700 transition-colors">
                  책의 지도
                </h4>
                <p className="text-[11px] text-[#7D8798] mt-1.5 leading-relaxed font-sans">
                  목차와 진행률을 조용히 관리해요.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex justify-end text-[#182A4D] font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200">
              <span className="font-sans flex items-center space-x-1">
                <span>입장하기</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>

          {/* Card 2: 집필 책상 (Writing Desk - editor) */}
          <div
            onClick={() => onViewChange("editor")}
            className="group cursor-pointer bg-white p-6 rounded-2xl border border-[#182A4D]/5 shadow-[0_2px_8px_rgba(24,42,77,0.01)] hover:shadow-[0_8px_20px_rgba(24,42,77,0.03)] hover:border-[#86D7E8]/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[155px]"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF6F5] flex items-center justify-center text-[#182A4D]">
                <PenTool className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[9px] text-[#D6B46A] tracking-wider font-bold block uppercase mb-0.5">WRITING DESK</span>
                <h4 className="text-xs font-serif font-bold text-[#182A4D] group-hover:text-cyan-700 transition-colors">
                  집필 책상
                </h4>
                <p className="text-[11px] text-[#7D8798] mt-1.5 leading-relaxed font-sans">
                  챕터별로 한 문장씩 쌓아가요.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex justify-end text-[#182A4D] font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200">
              <span className="font-sans flex items-center space-x-1">
                <span>입장하기</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>

          {/* Card 3: 문장 정원 (Sentence Garden - revisions) */}
          <div
            onClick={() => onViewChange("revisions")}
            className="group cursor-pointer bg-white p-6 rounded-2xl border border-[#182A4D]/5 shadow-[0_2px_8px_rgba(24,42,77,0.01)] hover:shadow-[0_8px_20px_rgba(24,42,77,0.03)] hover:border-[#86D7E8]/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[155px]"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF6F5] flex items-center justify-center text-[#182A4D]">
                <Sparkles className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[9px] text-[#D6B46A] tracking-wider font-bold block uppercase mb-0.5">GARDEN OF WORDS</span>
                <h4 className="text-xs font-serif font-bold text-[#182A4D] group-hover:text-cyan-700 transition-colors">
                  문장 정원
                </h4>
                <p className="text-[11px] text-[#7D8798] mt-1.5 leading-relaxed font-sans">
                  작가님의 문체를 지키며 다듬어요.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex justify-end text-[#182A4D] font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200">
              <span className="font-sans flex items-center space-x-1">
                <span>입장하기</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>

          {/* Card 4: 원고 서랍 (Manuscript Drawer - archive) */}
          <div
            onClick={() => onViewChange("archive")}
            className="group cursor-pointer bg-white p-6 rounded-2xl border border-[#182A4D]/5 shadow-[0_2px_8px_rgba(24,42,77,0.01)] hover:shadow-[0_8px_20px_rgba(24,42,77,0.03)] hover:border-[#86D7E8]/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[155px]"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF6F5] flex items-center justify-center text-[#182A4D]">
                <Archive className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[9px] text-[#D6B46A] tracking-wider font-bold block uppercase mb-0.5">MANUSCRIPT DRAWER</span>
                <h4 className="text-xs font-serif font-bold text-[#182A4D] group-hover:text-cyan-700 transition-colors">
                  원고 서랍
                </h4>
                <p className="text-[11px] text-[#7D8798] mt-1.5 leading-relaxed font-sans">
                  초안과 수정본을 차곡차곡 모아요.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex justify-end text-[#182A4D] font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200">
              <span className="font-sans flex items-center space-x-1">
                <span>입장하기</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
