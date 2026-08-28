import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Loader2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { Service } from '../../types';

export const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
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

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDuration('30');
    setIsActive(true);
    setEditingId(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setName(service.name);
    setDescription(service.description || '');
    setPrice(service.price.toString());
    setDuration(service.duration_minutes.toString());
    setIsActive(service.is_active);
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name,
      description: description || null,
      price: parseFloat(price),
      duration_minutes: parseInt(duration),
      is_active: isActive,
    };

    if (editingId) {
      await supabase.from('services').update(payload).eq('id', editingId);
    } else {
      await supabase.from('services').insert([payload]);
    }

    setIsSaving(false);
    setIsModalOpen(false);
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
          className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
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
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <p className="text-zinc-500">Nenhum serviço cadastrado ainda.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">Preço</th>
                <th className="px-6 py-4 font-medium">Duração</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-zinc-900">{service.name}</p>
                    {service.description && (
                      <p className="text-zinc-500 text-xs truncate max-w-[200px] mt-0.5">
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
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {service.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
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
      )}

      {/* Modal - Could be extracted to a separate component later */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900">
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Nome do serviço</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  placeholder="Ex: Corte Masculino"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Descrição (opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none"
                  placeholder="Ex: Corte na tesoura com lavagem inclusa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Duração (min)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1h</option>
                    <option value="90">1h 30m</option>
                    <option value="120">2h</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 bg-zinc-50 border-zinc-200 rounded focus:ring-zinc-900"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-zinc-700">
                  Serviço ativo
                </label>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 px-4 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex justify-center items-center"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
