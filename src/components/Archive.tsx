import React, { useState } from "react";
import { Search, Tag, ExternalLink, Trash2, BookOpen, Clock, FileDown, CheckCircle, ListFilter, Star } from "lucide-react";
import { Chapter, BookProject, ExportLog } from "../types";

interface ArchiveProps {
  projects: BookProject[];
  chapters: Chapter[];
  exportLogs: ExportLog[];
  onDeleteChapter: (id: string) => void;
  onSelectChapter: (id: string) => void;
  onViewChange: (view: string) => void;
  onExportToGDocs: (chapterId: string) => void;
}

export default function Archive({
  projects,
  chapters,
  exportLogs,
  onDeleteChapter,
  onSelectChapter,
  onViewChange,
  onExportToGDocs,
}: ArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookFilter, setSelectedBookFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    "chap-1": true, // preset Chapter 1 prologue as favorite
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter Chapters
  const filteredChapters = chapters.filter((chap) => {
    const matchesSearch = 
      chap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBook = selectedBookFilter === "all" || chap.bookId === selectedBookFilter;
    const matchesStatus = statusFilter === "all" || chap.status === statusFilter;

    return matchesSearch && matchesBook && matchesStatus;
  });

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = window.confirm(`"${title}" 원고를 정말 보관함에서 안전하게 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`);
    if (ok) {
      onDeleteChapter(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="archive-section">
      {/* Header and Filter Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#182A4D]">원고 보관함</h2>
          <p className="text-xs text-slate-400">집필실 파도 아래 조심스레 축적되어 온 모든 초안들과 내보낸 역사를 한눈에 바라봅니다.</p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="초안 내용 또는 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-200"
          />
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <ListFilter className="w-3.5 h-3.5 text-[#D6B46A]" />
            <span>분류 필터링:</span>
          </div>

          <select
            value={selectedBookFilter}
            onChange={(e) => setSelectedBookFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg text-xs outline-none text-slate-600 focus:ring-1 focus:ring-cyan-200"
          >
            <option value="all">모든 프로젝트 보기</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg text-xs outline-none text-slate-600 focus:ring-1 focus:ring-cyan-200"
          >
            <option value="all">모든 단계 보기</option>
            <option value="작성 전">작성 전</option>
            <option value="초안 작성 중">초안 작성 중</option>
            <option value="작성 완료">작성 완료</option>
          </select>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">검색 결과: 총 {filteredChapters.length}개 챕터</span>
      </div>

      {/* Chapters Cards Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="archive-chapters-grid">
        {filteredChapters.map((chap) => {
          const associatedBook = projects.find((p) => p.id === chap.bookId);
          const isFavorited = !!favorites[chap.id];
          const hasExportLogs = exportLogs.some((l) => l.chapterId === chap.id);

          return (
            <div
              key={chap.id}
              onClick={() => {
                onSelectChapter(chap.id);
                onViewChange("editor");
              }}
              className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Book project label tag */}
                  <span className="text-[9px] uppercase font-bold text-[#D6B46A] tracking-wider truncate max-w-[150px]">
                    {associatedBook ? associatedBook.title : "Syzhlin Book"}
                  </span>

                  <button
                    onClick={(e) => toggleFavorite(chap.id, e)}
                    className="p-1 rounded-full text-slate-300 hover:text-amber-400 transition"
                    title={isFavorited ? "중요 원고 지정 완료" : "중요 원고 지정"}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFavorited ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-[#182A4D] group-hover:text-cyan-700 transition line-clamp-1">
                  {chap.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {chap.content ? chap.content : chap.summary || "아직 작성된 내용이 없는 기획 상태입니다."}
                </p>
              </div>

              {/* Card Footer detail */}
              <div className="space-y-3 pt-3 border-t border-slate-50 text-[11px] text-slate-400">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    <span>마지막 수정: {new Date(chap.updatedAt).toLocaleDateString()}</span>
                  </span>
                  <span className="font-mono text-slate-500 font-semibold">{chap.wordCount.toLocaleString()}자</span>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-50/50 pt-2.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                    chap.status === "작성 완료" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-800 border-sky-200"
                  }`}>
                    {chap.status}
                  </span>

                  <div className="flex items-center space-x-2">
                    {hasExportLogs ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center bg-emerald-50 px-2 py-0.5 rounded">
                        <span>Docs 내보냄</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportToGDocs(chap.id);
                        }}
                        className="text-[10px] text-[#182A4D] font-bold hover:underline flex items-center space-x-0.5"
                        title="Google Docs로 즉시 내보내기"
                      >
                        <FileDown className="w-3 h-3 text-slate-400" />
                        <span>Docs 내보내기</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(chap.id, chap.title, e)}
                      className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-sm transition"
                      title="원고 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Docs Saved Log history list records */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4" id="export-history-table">
        <div>
          <h3 className="text-sm font-bold text-[#182A4D] flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Google Docs 내보내기 기록 보관</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">외부 저장소로 백업을 개시했던 소중한 집필 원고 연동 이력 목록입니다.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-bold text-slate-500">내보낸 파일명 / 문서 제목</th>
                <th className="py-2.5 px-4 font-bold text-slate-500">유형</th>
                <th className="py-2.5 px-4 font-bold text-slate-500">날짜</th>
                <th className="py-2.5 px-4 font-bold text-slate-500">문서 경로</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exportLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-800">{log.documentTitle}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-[#4285F4] text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border border-blue-200">
                      GOOGLE DOCS
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">
                    {new Date(log.exportedAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={log.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[#4285F4] hover:underline font-semibold"
                    >
                      <span>문서 열기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
              {exportLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs italic">
                    Google Docs로 성공적으로 내보낸 이력이 아직 존재 생성되지 않았습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
