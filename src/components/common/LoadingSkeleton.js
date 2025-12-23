// src/components/LoadingSkeleton.js
export default function LoadingSkeleton({ type = "default" }) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER PADRÃO (todas as páginas têm) */}
      <div className="w-48 h-6 bg-gray-200 animate-pulse rounded mb-6"></div>

      {/* ROTEAMENTO POR TIPO */}
      {type === "home" && <HomeSkeleton />}
      {type === "dashboard" && <DashboardSkeleton />}
      {type === "estoque" && <EstoqueSkeleton />}
      {type === "default" && <DefaultSkeleton />}
    </div>
  );
}

// ========== HOME (/) ==========
function HomeSkeleton() {
  return (
    <>
      <div className="w-28 h-8 bg-gray-200 animate-pulse rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-16 flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="space-y-1 flex-1">
              <div className="w-12 h-2.5 bg-gray-200 rounded"></div>
              <div className="w-16 h-5 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4">
        <div className="w-40 h-4 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== DASHBOARD ==========
function DashboardSkeleton() {
  return (
    <>
      <div className="w-32 h-9 bg-gray-200 animate-pulse rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-16">
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl h-64"></div>
        <div className="bg-white p-5 rounded-xl h-64"></div>
      </div>
      <div className="bg-white p-5 rounded-xl mb-6">
        <div className="w-48 h-5 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== ESTOQUE ==========
function EstoqueSkeleton() {
  return (
    <>
      <div className="w-28 h-8 bg-gray-200 animate-pulse rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-16">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="mt-2 w-16 h-5 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4">
        <div className="w-40 h-4 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== DEFAULT (genérico) ==========
function DefaultSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-20">
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}