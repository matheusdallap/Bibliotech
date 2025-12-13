// app/profile/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getUserProfile } from '@/lib/getUserProfile'
import { useAuthProtection } from '@/hooks/useAuthProtection'

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { user: authUser, loading: authLoading } = useAuthProtection()
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userId = params.id

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return
      
      try {
        setLoading(true)
        setError('')
        
        const result = await getUserProfile(userId)
        
        if (result.success) {
          setProfile(result.data)
        } else {
          setError(result.message || 'Erro ao carregar perfil')
          setProfile(null)
        }
      } catch (err) {
        console.error('Erro ao buscar perfil:', err)
        setError('Erro ao carregar informações do perfil')
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  // Verifica se o usuário atual é o dono do perfil ou um admin
  const isOwnProfile = currentUser?.id?.toString() === userId
  const isAdmin = currentUser?.is_admin === true
  const canEdit = isOwnProfile || isAdmin

  // Formata a data
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informada'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-red-200 dark:border-red-800/30 shadow-lg p-8">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Perfil não encontrado
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Perfil não encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                O usuário solicitado não existe ou não está disponível.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
              BIBLIOTECH
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">|</div>
            <div className="text-gray-700 dark:text-gray-300 font-medium hidden sm:block">
              Perfil do Usuário
            </div>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/dashboard" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho do Perfil */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                <span className="text-4xl font-bold">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.username || 'Usuário'}
                </h1>
                <p className="text-blue-100 opacity-90">
                  {profile.email || 'Sem e-mail'}
                </p>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {isAdmin && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      Administrador
                    </span>
                  )}
                  {canEdit && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {isOwnProfile ? 'Seu perfil' : 'Editável'}
                    </span>
                  )}
                </div>
              </div>
              
              {canEdit && (
                <Link 
                  href={`/profile/${userId}/edit`}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Editar Perfil
                </Link>
              )}
            </div>
          </div>

          {/* Informações do Perfil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informações Pessoais */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                Informações Pessoais
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nome de Usuário
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.username || 'Não informado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    E-mail
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.email || 'Não informado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nome Completo
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações da Conta */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                Informações da Conta
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    ID do Usuário
                  </label>
                  <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                    {profile.id || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Data de Criação
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(profile.date_joined)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tipo de Conta
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.is_admin ? 'Administrador' : 'Leitor'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          {canEdit && (
            <div className="mt-8 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Ações Rápidas
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link 
                  href={`/profile/${userId}/edit`}
                  className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Editar Perfil</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Atualizar informações pessoais</p>
                  </div>
                </Link>
                
                <Link 
                  href={`/profile/${userId}/security`}
                  className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/30 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Segurança</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Alterar senha e segurança</p>
                  </div>
                </Link>
                
                {isAdmin && (
                  <Link 
                    href="/admin/usersList"
                    className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-5.197v-1a6 6 0 00-9-5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Gerenciar Usuários</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Painel de administração</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Estatísticas (placeholder) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">0</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Livros Lidos</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total de livros</div>
            </div>
            
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">0</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Em Leitura</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Livros atuais</div>
            </div>
            
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">0</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Emprestados</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">No momento</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Bibliotech. Perfil do usuário.</p>
          <p className="text-sm mt-2">
            {isOwnProfile ? 'Seu perfil' : `Perfil de ${profile.username}`} • ID: {profile.id}
          </p>
        </div>
      </footer>
    </div>
  )
}