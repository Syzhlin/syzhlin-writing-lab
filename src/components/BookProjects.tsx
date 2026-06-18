import React, { useState } from "react";
import { PlusCircle, Book, Target, Award, Calendar, ChevronRight, PenTool, BookOpen } from "lucide-react";
import { BookProject, ProjectStatus } from "../types";

interface BookProjectsProps {
  projects: BookProject[];
  onCreateProject: (project: Omit<BookProject, "id" | "createdAt" | "updatedAt" | "currentWordCount">) => void;
  onSelectProject: (projectId: string) => void;
}

export default function BookProjects({
  projects,
  onCreateProject,
  onSelectProject,
}: BookProjectsProps) {
  const [showForm, setShowForm] = useState(false);
  
  // Local Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetWordCount, setTargetWordCount] = useState(80000);
  const [status, setStatus] = useState<ProjectStatus>("기획 중");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateProject({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      targetWordCount: Number(targetWordCount) || 50000,
      status: status,
    });

    // Reset Form
    setTitle("");
    setSubtitle("");
    setDescription("");
    setTargetWordCount(80000);
    setStatus("기획 중");
    setShowForm(false);
  };

  const getStatusColor = (s: ProjectStatus) => {
    switch (s) {
      case "기획 중": return "bg-amber-100 text-amber-800 border-amber-200";
      case "초안 작성 중": return "bg-sky-100 text-sky-800 border-sky-200";
      case "수정 중": return "bg-purple-100 text-purple-800 border-purple-200";
      case "퇴고 중": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "완성": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6" id="book-projects-section">
      {/* Upper Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#182A4D]">내 책 프로젝트</h2>
          <p className="text-xs text-slate-400">당신의 머릿속 영감을 영구한 권으로 엮어가는 공간입니다.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#182A4D] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>새 책 집필하기</span>
        </button>
      </div>

      {/* Project Creator Form Modal Drawer */}
      {showForm && (
        <div className="bg-amber-50/50 p-6 rounded-2xl border border-cyan-100 shadow-sm animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-[#182A4D] border-b border-cyan-100 pb-2">
              새로운 책 기획안 작안
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">책 제목 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="예: 바다를 가르는 소리"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#86D7E8]/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">책 부제</label>
                <input
                  type="text"
                  placeholder="예: 밀려오고 밀려가는 감정의 해안선"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#86D7E8]/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">책 소개 및 시놉시스</label>
              <textarea
                placeholder="책의 줄거리나 기획 의도, 독자에게 전하고 싶은 메시지를 적어주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-white p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#86D7E8]/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">목표 글자 수 (최종 원고 기준)</label>
                <input
                  type="number"
                  placeholder="80000"
                  value={targetWordCount}
                  onChange={(e) => setTargetWordCount(Number(e.target.value))}
                  className="w-full bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#86D7E8]/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">현재 단계 고정</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#86D7E8]/50"
                >
                  <option value="기획 중">기획 중</option>
                  <option value="초안 작성 중">초안 작성 중</option>
                  <option value="수정 중">수정 중</option>
                  <option value="퇴고 중">퇴고 중</option>
                  <option value="완성">완성</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#182A4D] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
              >
                프로젝트 만들기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Book Project Grid Lists */}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((proj) => {
          const progressPercent = Math.min(100, Math.round((proj.currentWordCount / proj.targetWordCount) * 100));
          
          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="group cursor-pointer bg-white rounded-3xl border border-[#182A4D]/5 p-6 md:p-8 shadow-sm hover:shadow-md hover:border-[#86D7E8] transition-all flex flex-col md:flex-row gap-6 md:items-center justify-between"
            >
              <div className="space-y-4 max-w-2xl flex-1">
                {/* Upper labels */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded border font-bold uppercase tracking-wide ${getStatusColor(proj.status)}`}>
                    {proj.status}
                  </span>
                  <span className="text-[10px] text-[#7D8798] font-bold uppercase tracking-widest flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-[#7D8798]/75" />
                    <span>기획 시점: {new Date(proj.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                {/* Typography of Titles */}
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#182A4D] group-hover:text-[#86D7E8] transition-colors leading-tight">
                    {proj.title}
                  </h3>
                  {proj.subtitle && (
                    <p className="text-xs font-sans text-[#D6B46A] tracking-wide font-semibold mt-1">
                      {proj.subtitle}
                    </p>
                  )}
                  {proj.description && (
                    <p className="text-xs text-[#7D8798] mt-2 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Target className="w-3.5 h-3.5 text-slate-400" />
                      <span>원고 달성률</span>
                    </span>
                    <span className="font-mono">
                      {proj.currentWordCount.toLocaleString()} / {proj.targetWordCount.toLocaleString()}자
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#BFEDEB] via-[#86D7E8] to-[#182A4D] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Percentage Display Right Box */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-[#182A4D]/5 pt-4 md:pt-0 shrink-0">
                <div className="text-left md:text-right">
                  <p className="text-3xl font-serif font-bold text-[#182A4D] group-hover:text-cyan-600 transition-colors">{progressPercent}%</p>
                  <p className="text-[10px] text-[#7D8798] uppercase tracking-wider font-bold">Progress</p>
                </div>
                <button className="h-11 w-11 rounded-full bg-[#F8F5EF] text-[#182A4D] border border-[#182A4D]/10 group-hover:bg-[#182A4D] group-hover:text-white transition-all flex items-center justify-center shadow-sm shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
