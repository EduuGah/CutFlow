import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Loader2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { Service } from '../../types';

export const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setServices(data as Service[]);
    }
    setIsLoading(false);
  };

  const formatPriceInput = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '');
    if (!onlyDigits) return '';
    const numberValue = parseInt(onlyDigits, 10) / 100;
    return numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(formatPriceInput(e.target.value));
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDuration('');
    setIsActive(true);
    setEditingId(null);
    setSaveError(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setName(service.name);
    setDescription(service.description || '');
    // Ensure the price displays correctly on edit
    const formattedPrice = Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setPrice(formattedPrice);
    setDuration(service.duration_minutes.toString());
    setIsActive(service.is_active);
    setEditingId(service.id);
    setSaveError(null);
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    // Convert formatted price back to float
    const numericPrice = parseFloat(price.replace(/\./g, '').replace(',', '.'));

    const payload = {
      name,
      description: description || null,
      price: numericPrice,
      duration_minutes: parseInt(duration),
      is_active: isActive,
    };

    let error = null;

    if (editingId) {
      const { error: updateError } = await supabase.from('services').update(payload).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('services').insert([payload]);
      error = insertError;
    }

    if (error) {
      console.error("Erro ao salvar:", error);
      // Catch specific RLS error
      if (error.code === '42501') {
        setSaveError("Permissão negada (RLS). Você precisa configurar a política de INSERT/UPDATE no banco de dados.");
      } else {
        setSaveError(error.message || "Ocorreu um erro ao salvar o serviço.");
      }
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsDrawerOpen(false);
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Serviços</h1>
          <p className="text-zinc-500 mt-1">Gerencie os serviços oferecidos pela barbearia</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-medium text-zinc-900">Nenhum serviço</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">Comece adicionando os serviços que sua barbearia oferece para que os clientes possam agendar.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Serviço</th>
                <th className="px-6 py-4 font-medium">Preço</th>
                <th className="px-6 py-4 font-medium">Duração</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-zinc-900">{service.name}</p>
                    {service.description && (
                      <p className="text-zinc-500 text-xs truncate max-w-xs mt-0.5">
                        {service.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    R$ {Number(service.price).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{service.duration_minutes} min</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        service.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {service.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="inline-flex p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-zinc-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <form id="service-form" onSubmit={handleSave} className="p-6 space-y-6">
                
                {saveError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{saveError}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-900">Nome do serviço</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="Ex: Corte Masculino"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-900">Descrição (opcional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none"
                    placeholder="Explique o que está incluso neste serviço..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-900">Preço</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-zinc-500 sm:text-sm">R$</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={price}
                        onChange={handlePriceChange}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-900">Duração (minutos)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                      placeholder="Ex: 45"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="relative flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
                    <span className="text-sm font-medium text-zinc-900">Serviço Ativo no Catálogo</span>
                  </label>
                  <p className="text-xs text-zinc-500 mt-1 pl-14">
                    Serviços inativos não aparecem para novos agendamentos.
                  </p>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-zinc-200 bg-zinc-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-2.5 px-4 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="service-form"
                disabled={isSaving || !price || !duration || !name}
                className="flex-1 py-2.5 px-4 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex justify-center items-center"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Serviço'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
