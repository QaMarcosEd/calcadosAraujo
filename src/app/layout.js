// // src/app/layout.js
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import CustomToaster from "@/components/common/CustomToaster";
// import Sidebar from "../components/layout/SideBar";
// import { SidebarProvider } from "@/components/layout/SidebarContext";
// import MainContent from "@/components/layout/MainContent";
// import AuthProvider from "../components/providers/SessionProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Gerenciador de Estoque",
//   description: "Sistema para loja de calçados",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="pt-BR">
//       <body
//         suppressHydrationWarning
//         className={`
//           ${geistSans.variable} ${geistMono.variable} antialiased
//           /* ✅ FUNDO NO BODY - NUNCA MAIS PARTE PRETA */
//           bg-gray-50 dark:bg-gray-900
//         `}
//       >
//         <AuthProvider>
//           <SidebarProvider>
//             <div className="min-h-screen flex">
//               <Sidebar />
//               <MainContent>{children}</MainContent>
//             </div>
//           </SidebarProvider>
//           <CustomToaster />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomToaster from "@/components/common/CustomToaster";
import AuthProvider from "@/components/providers/SessionProvider";
import { SidebarProvider } from "@/components/layout/SidebarContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Calçados Araújo - Gerenciador",
  description: "Sistema interno da loja de calçados",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable} 
          antialiased bg-gray-50 dark:bg-gray-900
        `}
        suppressHydrationWarning
      >
        {/* Providers globais */}
        <AuthProvider>
          <SidebarProvider>
            {/* Conteúdo dinâmico: login, (admin), dashboard... */}
            {children}

            {/* Toaster fixo */}
            <CustomToaster />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}