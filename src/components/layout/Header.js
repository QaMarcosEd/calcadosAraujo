import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';

const PageHeader = ({ title = 'Dashboard', greeting = '👟 Visão Geral - Calçados Araújo', showDate = true }) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), 'dd/MM/yyyy HH:mm'));
    
    // ATUALIZA A CADA MINUTO
    const interval = setInterval(() => {
      setCurrentDate(format(new Date(), 'dd/MM/yyyy HH:mm'));
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* ESQUERDA - TÍTULO + ÍCONE */}
          <div className="flex items-center gap-4">
            {/* ÍCONE 3D */}
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#394189]/10 to-[#c33638]/10 flex items-center justify-center shadow-lg border border-[#394189]/20">
              <LayoutDashboard 
                className="w-6 h-6" 
                style={{ color: '#394189' }}
              />
            </div>
            
            {/* TÍTULO */}
            <div>
              <h2 className="text-2xl font-bold font-poppins bg-gradient-to-r from-[#394189] to-[#c33638] bg-clip-text text-transparent mb-1">
                {title}
              </h2>
              {showDate && (
                <p className="text-xs font-poppins text-gray-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Atualizado {currentDate}
                </p>
              )}
            </div>
          </div>
          
          {/* DIREITA - SAUDAÇÃO */}
          <div className="text-right">
            <h3 className="text-xl font-semibold font-poppins text-gray-700">
              {greeting}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
