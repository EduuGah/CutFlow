import React, { useEffect, useState } from 'react';
import { Clock, Pencil, Plus, Scissors } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { Service } from '../../types';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Notice } from '../../components/ui/Field';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

const brl = (value: number) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Entrada de preço em centavos: o usuário digita números, a máscara formata. */
const maskPrice = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parsePrice = (value: string) => parseFloat(value.replace(/\./g, '').replace(',', '.'));

const emptyForm = {
  name: '',
  description: '',
  price: '',
  duration: '',
  isActive: true,
};

export const ServicesManagement = () => {
  const toast = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Não deu para carregar o catálogo.');
    } else {
      setServices((data as Service[]) ?? []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSaveError(null);
    setIsDrawerOpen(true);
  };

  const openEdit = (service: Service) => {
    setForm({
      name: service.name,
      description: service.description ?? '',
      price: brl(service.price),
      duration: String(service.duration_minutes),
      isActive: service.is_active,
    });
    setEditingId(service.id);
    setSaveError(null);
    setIsDrawerOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parsePrice(form.price),
      duration_minutes: parseInt(form.duration, 10),
      is_active: form.isActive,
    };

    const { error } = editingId
      ? await supabase.from('services').update(payload).eq('id', editingId)
      : await supabase.from('services').insert([payload]);

    setIsSaving(false);

    if (error) {
      console.error(error);
      setSaveError(
        error.code === '42501'
          ? 'O banco recusou a gravação (RLS). Configure a política de INSERT/UPDATE da tabela services.'
          : error.message
      );
      return;
    }

    setIsDrawerOpen(false);
    toast.success(editingId ? 'Serviço atualizado.' : 'Serviço criado.');
    fetchServices();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Catálogo"
        title="Serviços"
        description="O que a barbearia oferece, quanto custa e quanto tempo ocupa a cadeira."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo serviço
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Catálogo vazio"
          description="Cadastre os serviços da casa para que os clientes possam escolher ao agendar."
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              Cadastrar primeiro serviço
            </Button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden border-b border-line bg-chalk/60 px-5 py-3 sm:grid sm:grid-cols-[1fr_7rem_7rem_6rem_3rem] sm:gap-4">
            {['Serviço', 'Preço', 'Duração', 'Status', ''].map((heading, index) => (
              <span key={index} className="type-tag text-ash">
                {heading}
              </span>
            ))}
          </div>

          <ul className="divide-y divide-line-soft">
            {services.map((service, index) => (
              <li
                key={service.id}
                className="anim-rise-sm grid gap-3 px-5 py-4 transition-colors hover:bg-chalk/40 sm:grid-cols-[1fr_7rem_7rem_6rem_3rem] sm:items-center sm:gap-4"
                style={{ ['--d' as string]: `${index * 45}ms` }}
              >
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-semibold text-ink">{service.name}</p>
                  {service.description && (
                    <p className="mt-0.5 truncate text-sm text-smoke">{service.description}</p>
                  )}
                </div>

                <p className="type-num text-sm font-medium text-ink">R$ {brl(service.price)}</p>

                <p className="type-num flex items-center gap-1.5 text-sm text-smoke">
                  <Clock className="h-3.5 w-3.5 text-ash sm:hidden" />
                  {service.duration_minutes} min
                </p>

                <span
                  className={`pill w-fit ${service.is_active ? 'pill-verdigris' : 'pill-neutral'}`}
                >
                  {service.is_active ? 'No ar' : 'Fora do ar'}
                </span>

                <button
                  type="button"
                  onClick={() => openEdit(service)}
                  className="icon-btn justify-self-start sm:justify-self-end"
                  aria-label={`Editar ${service.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? 'Editar serviço' : 'Novo serviço'}
        subtitle={editingId ? form.name : 'Preencha o que o cliente vai ver ao agendar.'}
        footer={
          <>
            <Button variant="outline" block onClick={() => setIsDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="service-form"
              block
              loading={isSaving}
              loadingLabel="Salvando"
              disabled={!form.name || !form.price || !form.duration}
            >
              {editingId ? 'Salvar alterações' : 'Criar serviço'}
            </Button>
          </>
        }
      >
        <form id="service-form" onSubmit={handleSave} className="space-y-5 p-6">
          {saveError && <Notice tone="error">{saveError}</Notice>}

          <div>
            <label className="label" htmlFor="service-name">
              Nome do serviço
            </label>
            <input
              id="service-name"
              type="text"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="input"
              placeholder="Corte masculino"
            />
          </div>

          <div>
            <label className="label" htmlFor="service-description">
              Descrição (opcional)
            </label>
            <textarea
              id="service-description"
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="input resize-none"
              placeholder="O que está incluso neste serviço"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="service-price">
                Preço
              </label>
              <div className="relative">
                <span className="type-num pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-ash">
                  R$
                </span>
                <input
                  id="service-price"
                  type="text"
                  inputMode="numeric"
                  required
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: maskPrice(event.target.value) })}
                  className="input type-num pl-10"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="service-duration">
                Duração (min)
              </label>
              <input
                id="service-duration"
                type="number"
                min={1}
                required
                value={form.duration}
                onChange={(event) => setForm({ ...form, duration: event.target.value })}
                className="input type-num"
                placeholder="45"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              className="switch-input sr-only"
            />
            <span className="switch-track" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold text-ink">Disponível para agendamento</span>
              <span className="mt-0.5 block text-xs text-smoke">
                Serviços fora do ar somem da lista dos clientes.
              </span>
            </span>
          </label>
        </form>
      </Drawer>
    </div>
  );
};
