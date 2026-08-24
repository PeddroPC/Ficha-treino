import { PageHeader } from "../components/shared/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import useWorkoutStore from "../stores/useWorkoutStore.js";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import FormFicha from "../components/forms/FormFicha.jsx";

export default function WorkoutSheetsPage() {
  const sheets = useWorkoutStore((s) => s.sheets);

  const [editingExercise, setEditingExercise] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExercise(null);
  };

  return (
    <div>
      <PageHeader
        title="Fichas de Treino"
        subtitle="Organize seus treinos em fichas personalizadas"
        action={
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            + Nova Ficha
          </button>
        }
      />
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto backdrop-blur-sm transition-all"
          role="dialog"
          aria-modal="true"
        >
          <div className="my-auto w-full flex justify-center">
            <FormFicha
              exercise={editingExercise}
              onSubmit={closeForm}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {sheets.length === 0 ? (
        <Card className="py-16 text-center">
          <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">
            Nenhuma ficha criada ainda
          </p>
          <p className="text-gray-300 text-sm mt-1">
            Crie sua primeira ficha de treino para começar
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sheets.map((sheet) => (
            <Card key={sheet.id}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClipboardList size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {sheet.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {sheet.description}
                  </p>
                </div>
                {sheet.isActive && (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    Ativa
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
