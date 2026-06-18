import React from "react";
import { Link2, Settings, Waves, BookOpen, PenTool, Sparkles, Archive, Unlink } from "lucide-react";

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  gdocsLinked: boolean;
  onToggleGdocs: () => void;
  onOpenSettings: () => void;
}

export default function Header({
  currentView,
  onViewChange,
  gdocsLinked,
  onToggleGdocs,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#182A4D]/10 bg-white px-8 py-3.5 flex items-center justify-between shrink-0">
      {/* Brand Logo & Name */}
      <div 
        className="flex items-center space-x-3 cursor-pointer select-none"
        onClick={() => onViewChange("home")}
        id="header-brand-logo"
      >
        <div className="w-10 h-10 bg-[#182A4D] rounded-lg flex items-center justify-center shadow-sm shrink-0">
          <div className="w-[18px] h-[18px] border-2 border-white rounded-sm rotate-45"></div>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="font-serif text-base font-bold tracking-tight text-[#182A4D]">
              Syzhlin Writing Lab
            </h1>
            <span className="text-[8px] bg-[#BFEDEB] text-[#182A4D] font-bold px-1 py-0.5 rounded uppercase tracking-wider">
              Studio
            </span>
          </div>
          <p className="text-[9px] text-[#7D8798] uppercase tracking-widest font-bold">
            나만의 바다 집필실
          </p>
        </div>
      </div>

      {/* Navigation Space */}
      <nav id="header-nav-menu" className="hidden md:flex items-center space-x-1">
        <button
          onClick={() => onViewChange("projects")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentView === "projects" || currentView === "project-detail"
              ? "bg-[#86D7E8]/15 text-[#182A4D] font-bold"
              : "text-[#7D8798] hover:bg-[#F8F5EF] hover:text-[#182A4D]"
          }`}
        >
          <BookOpen className="w-4 h-4 opacity-70" />
          <span>내 책 프로젝트</span>
        </button>

        <button
          onClick={() => onViewChange("editor")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentView === "editor"
              ? "bg-[#86D7E8]/15 text-[#182A4D] font-bold"
              : "text-[#7D8798] hover:bg-[#F8F5EF] hover:text-[#182A4D]"
          }`}
        >
          <PenTool className="w-4 h-4 opacity-70" />
          <span>원고 쓰기</span>
        </button>

        <button
          onClick={() => onViewChange("revisions")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentView === "revisions"
              ? "bg-[#86D7E8]/15 text-[#182A4D] font-bold"
              : "text-[#7D8798] hover:bg-[#F8F5EF] hover:text-[#182A4D]"
          }`}
        >
          <Sparkles className="w-4 h-4 opacity-70" />
          <span>원고 다듬기</span>
        </button>

        <button
          onClick={() => onViewChange("archive")}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentView === "archive"
              ? "bg-[#86D7E8]/15 text-[#182A4D] font-bold"
              : "text-[#7D8798] hover:bg-[#F8F5EF] hover:text-[#182A4D]"
          }`}
        >
          <Archive className="w-4 h-4 opacity-70" />
          <span>원고 보관함</span>
        </button>
      </nav>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          id="btn-google-docs-link"
          onClick={onToggleGdocs}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-full text-xs font-bold tracking-tight transition-all ${
            gdocsLinked
              ? "bg-[#BFEDEB] text-[#182A4D] border-[#182A4D]/10 hover:bg-[#86D7E8]/40"
              : "bg-white text-[#182A4D] border-[#182A4D]/20 hover:bg-[#F8F5EF]"
          }`}
          title={gdocsLinked ? "Google Docs 연동 완료" : "Google Docs 연동하기"}
        >
          <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.5 14H19v-2h-4.5v2zm0-4H19V8h-4.5v2zm0-4H19V4h-4.5v2zm-7 12H12v-2H7.5v2zm0-4H12V8H7.5v2zm0-4H12V4H7.5v2zm11.5 14c.83 0 1.5-.67 1.5-1.5V1.5C20.5.67 19.83 0 19 0H5c-.83 0-1.5.67-1.5 1.5v21c0 .83.67 1.5 1.5 1.5h14zM5 22V2h14v20H5z"/>
          </svg>
          <span>{gdocsLinked ? "Docs 연동 중" : "Google Docs 연동"}</span>
        </button>

        <button
          id="btn-header-settings"
          onClick={onOpenSettings}
          className="w-9 h-9 flex items-center justify-center bg-[#F8F5EF] rounded-full text-[#182A4D] hover:bg-[#182A4D] hover:text-white transition-all shadow-sm"
          title="설정"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
}
