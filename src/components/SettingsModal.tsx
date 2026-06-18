import React, { useState } from "react";
import { Settings, Save, Link2, Unlink, Check, HelpCircle, User, FileText, ChevronRight, Goal } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
  gdocsLinked: boolean;
  onToggleGdocs: () => void;
  userEmail?: string;
  defaultGoal: number;
  onSaveConfig: (goal: number, autoSave: boolean) => void;
}

export default function SettingsModal({
  onClose,
  gdocsLinked,
  onToggleGdocs,
  userEmail = "studywithseijin@gmail.com",
  defaultGoal,
  onSaveConfig,
}: SettingsModalProps) {
  const [goal, setGoal] = useState(defaultGoal);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [exportBehavior, setExportBehavior] = useState<"new" | "update">("new");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(goal, autoSaveEnabled);
    alert("집필실 기본 설정과 목표가 정갈하게 동기화되었습니다.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" id="settings-modal-panel">
      <div className="bg-[#F8F5EF] max-w-md w-full rounded-3xl border border-amber-200 p-6 md:p-8 shadow-xl flex flex-col justify-between space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-100 pb-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#182A4D]" />
            <h3 className="text-sm font-bold text-[#182A4D] font-sans">집필 스튜디오 환경 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-[#182A4D] font-bold p-1 rounded-lg transition"
          >
            ✕ 닫기
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          {/* Section: Google Docs Authentication */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
            <span className="font-bold text-slate-705 block uppercase tracking-wider text-[10px]">
              외부 클라우드 스토리지 연동
            </span>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-[#4285F4]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Google Docs API</h4>
                  <p className="text-[10px] text-slate-400">
                    {gdocsLinked ? `${userEmail}` : "구글 문서도구를 통한 실시간 원고 백업"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleGdocs}
                className={`py-1.5 px-3 rounded-xl border text-[10px] font-bold tracking-tight transition ${
                  gdocsLinked
                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {gdocsLinked ? "연결 해제" : "Google 연결"}
              </button>
            </div>

            {gdocsLinked && (
              <div className="border-t border-slate-50 pt-2.5 space-y-2">
                <span className="text-[10px] text-slate-400">문서 내보내기 방식 처리 규칙:</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-xl border cursor-pointer text-center font-semibold transition ${
                    exportBehavior === "new"
                      ? "bg-cyan-50 text-[#182A4D] border-cyan-200"
                      : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100/50"
                  }`}>
                    <input
                      type="radio"
                      name="exportBehavior"
                      checked={exportBehavior === "new"}
                      onChange={() => setExportBehavior("new")}
                      className="sr-only"
                    />
                    <div className="text-[10px] font-bold">새 양식 생성</div>
                    <div className="text-[9px] text-slate-400 font-normal mt-0.5">서로 다른 문서로 저장</div>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer text-center font-semibold transition ${
                    exportBehavior === "update"
                      ? "bg-cyan-50 text-[#182A4D] border-cyan-200"
                      : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100/50"
                  }`}>
                    <input
                      type="radio"
                      name="exportBehavior"
                      checked={exportBehavior === "update"}
                      onChange={() => setExportBehavior("update")}
                      className="sr-only"
                    />
                    <div className="text-[10px] font-bold">기존 문서 업데이트</div>
                    <div className="text-[9px] text-slate-400 font-normal mt-0.5">내보낼 때 파일 갱신</div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section: Daily goals and configurations */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
            <span className="font-bold text-slate-705 block uppercase tracking-wider text-[10px]">
              기본 작업 목표 사안
            </span>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-600 block">하루 권장 원고 작성량 (자수 단위)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-200 font-mono text-xs font-bold"
                />
                <span className="text-slate-400">자 / 하루 기준</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <div>
                <h5 className="font-bold text-slate-700">임시 자동 저장 상태 고정</h5>
                <p className="text-[10px] text-slate-400">키보드 정지 시 1.2초 후 바다 서재로 자동 연동</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-cyan-100/50 flex space-x-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl font-semibold transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#182A4D] hover:bg-slate-800 text-white rounded-xl font-semibold transition"
            >
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
