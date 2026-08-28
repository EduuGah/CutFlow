import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, Mail, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfileSettings = () => {
  const { profile, refreshProfile } = useAuth();
  
  const [fullName, setFullName] = useState('');

  const formatPhone = (val: string) => {
    let v = val.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    
    if (v.length <= 10) {
      // Landline: (XX) XXXX-XXXX
      v = v.replace(/(\d{2})(\d)/, '($1) $2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // Mobile: (XX) XXXXX-XXXX
      v = v.replace(/(\d{2})(\d)/, '($1) $2');
      v = v.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return v;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };
  const [phone, setPhone] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setIsLoading(false);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSaving(true);
    setMessage(null);
    
    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone: phone || null
      })
      .eq('id', profile.id);
      
    if (error) {
      console.error('Update profile error:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar o perfil: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      await refreshProfile();
      // Clear success message after 3s
      setTimeout(() => setMessage(null), 3000);
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Meu Perfil</h1>
        <p className="text-zinc-500 mt-1">Gerencie suas informações pessoais e de contato.</p>
      </div>
      
      {message && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <User className="w-8 h-8 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900">{profile?.full_name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-zinc-500 font-medium">
              <Shield className="w-4 h-4" />
              <span>{profile?.role === 'ADMIN' ? 'Administrador' : profile?.role === 'BARBER' ? 'Barbeiro' : 'Cliente'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-500 focus:outline-none cursor-not-allowed opacity-70"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-medium">O email de acesso não pode ser alterado por aqui.</p>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-semibold text-zinc-700 mb-1.5">Nome Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-zinc-700 mb-1.5">Telefone / WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white font-semibold rounded-2xl hover:bg-zinc-800 hover:-translate-y-0.5 transition-all shadow-md shadow-zinc-900/10 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
