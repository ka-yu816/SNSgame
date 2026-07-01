import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto max-w-[380px] w-full h-[760px] bg-slate-900 rounded-[50px] p-3.5 shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden">
      {/* スマホのスピーカー・カメラのノッチ */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-5.5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-10 h-1 bg-slate-800 rounded-full mb-1"></div>
      </div>

      {/* 画面インナー */}
      <div className="flex-1 w-full h-full bg-slate-50 rounded-[36px] overflow-hidden flex flex-col relative pt-4 text-slate-800">
        {/* ステータスバー */}
        <div className="h-6 px-6 flex justify-between items-center text-[11px] font-sans font-semibold text-slate-500 z-40 select-none">
          <div>12:00</div>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-400 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* 画面コンテンツ */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          {children}
        </div>

        {/* ホームバー */}
        <div className="h-5 flex items-center justify-center pb-2">
          <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
