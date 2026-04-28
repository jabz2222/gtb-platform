export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Page heading skeleton */}
      <div className="mb-8">
        <div className="h-3 w-24 bg-white/5 rounded mb-2" />
        <div className="h-9 w-64 bg-white/5 rounded mb-2" />
        <div className="h-3 w-48 bg-white/5 rounded" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
            <div className="h-2.5 w-16 bg-white/5 rounded mb-3" />
            <div className="h-8 w-12 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <div className="h-2.5 w-32 bg-white/5 rounded" />
            </div>
            <div className="divide-y divide-white/[0.04]">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-sm bg-white/5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-white/5 rounded" />
                    <div className="h-2.5 w-1/2 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
