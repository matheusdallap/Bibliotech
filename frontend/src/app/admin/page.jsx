// app/admin/page.jsx
'use client'

import { useState } from 'react'
import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function AdminPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        {/* Header */}
        <header className="container mx-auto px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
                BIBLIOTECH
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">|</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium hidden sm:block">Painel Administrativo</div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/catalogue" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base"
              >
                Voltar ao Catálogo
              </Link>
              
              {/* Botão de Logout */}
              <Link href="/admin/usersList">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Saindo...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium hidden sm:inline">Sair</span>
                  </>
                )}
              </button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Cabeçalho */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Painel do Administrador
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Gerencie o conteúdo e os usuários da biblioteca
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Botão Ver Livros */}
              <Link href="/admin/books">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 border border-blue-500 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Ver Livros</h2>
                    <p className="text-blue-100 text-base">
                      Gerencie todo o acervo da biblioteca
                    </p>
                  </div>
                </div>
              </Link>

              {/* Botão Ver Usuários */}
              <Link href="/admin/usersList">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 border border-indigo-500 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-5.197v-1a6 6 0 00-9-5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Ver Usuários</h2>
                    <p className="text-indigo-100 text-base">
                      Gerencie todos os usuários do sistema
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Botões Secundários */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/admin/newBook">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Inserir Novo Livro</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Adicione um novo livro ao catálogo</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/settings">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Configurações</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Ajustes do sistema administrativo</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2025 Bibliotech Admin. Acesso restrito a administradores.</p>
            <p className="text-sm mt-2">Painel Administrativo • Versão 1.0</p>
          </div>
        </footer>
      </div>
    </AdminRoute>
  )
}