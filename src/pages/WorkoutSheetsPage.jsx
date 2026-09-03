import { PageHeader } from "../components/shared/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import useWorkoutStore from "../stores/useWorkoutStore.js";
import { ClipboardList, Check, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import FormFicha from "../components/forms/FormFicha.jsx";
import { ConfirmDeleteModal } from "../components/ui/ConfirmDeleteModal.jsx";

export default function WorkoutSheetsPage() {
  const sheets = useWorkoutStore((s) => s.sheets);
  const removeSheet = useWorkoutStore((s) => s.removeSheet);

  const [editingSheet, setEditingSheet] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingSheet, setDeletingSheet] = useState(null);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSheet(null);
  };

  const confirmDelete = () => {
    if (deletingSheet) {
      removeSheet(deletingSheet.id);
    }
  };

  useEffect(() => {
    if (!isFormOpen) return;
    const handler = (e) => { if (e.key === 'Escape') closeForm() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFormOpen])

  return (
    <div>
      <PageHeader
        title="Fichas de Treino"
        subtitle="Organize seus treinos em fichas personalizadas"
        action={
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            data-testid="btn-new-sheet"
            className="bg-brand-action hover:opacity-90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-opacity"
          >
            + Nova Ficha
          </button>
        }
      />
      
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm transition-all"
          role="dialog"
          aria-modal="true"
        >
          <div className="my-auto w-full flex justify-center">
            <FormFicha
              sheet={editingSheet}
              onSubmit={closeForm}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      <ConfirmDeleteModal 
        isOpen={!!deletingSheet}
        onClose={() => setDeletingSheet(null)}
        onConfirm={confirmDelete}
        itemName={deletingSheet?.name || ""}
        title="Excluir Ficha de Treino"
        description="Esta ação não pode ser desfeita e excluirá também a estrutura de exercícios vinculados a esta ficha (os logs de treino antigos serão mantidos)."
      />

      {sheets.length === 0 ? (
        <div className="bg-brand-surface border border-brand-elevated rounded-xl py-16 text-center shadow-sm">
          <ClipboardList size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-medium">
            Nenhuma ficha criada ainda
          </p>
          <p className="text-text-muted text-sm mt-1">
            Crie sua primeira ficha de treino para começar
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="bg-brand-surface border border-brand-elevated rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-elevated rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClipboardList size={18} className="text-brand-action" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-text-primary text-sm truncate">
                      {sheet.name}
                    </h3>
                    {sheet.isActive && (
                      <Check 
                        size={16} 
                        strokeWidth={3} 
                        className="text-emerald-500 flex-shrink-0" 
                        title="Ficha Ativa" 
                      />
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {sheet.description}
                  </p>
                </div>

                <div className="flex flex-col gap-1 items-end shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSheet(sheet);
                      setIsFormOpen(true);
                    }}
                    data-testid={`btn-edit-sheet-${sheet.id}`}
                    aria-label={`Editar ficha ${sheet.name}`}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-brand-action transition hover:bg-brand-elevated"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingSheet(sheet)}
                    data-testid={`btn-delete-sheet-${sheet.id}`}
                    aria-label={`Excluir ficha ${sheet.name}`}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 transition hover:bg-brand-elevated"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}