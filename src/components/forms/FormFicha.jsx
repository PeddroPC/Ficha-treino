import { useState } from "react";
import useExerciseStore from "../../stores/useExerciseStore.js";
import useWorkoutStore from "../../stores/useWorkoutStore.js";
import { X, Trash2, Dumbbell } from "lucide-react";

const FormFicha = ({ sheet = null, onSubmit, onCancel }) => {
  const exercises = useExerciseStore((s) => s.exercises);
  const addSheet = useWorkoutStore((s) => s.addSheet);
  const updateSheet = useWorkoutStore((s) => s.updateSheet);
  const sheetExercises = useWorkoutStore((s) => s.sheetExercises);
  const replaceSheetExercises = useWorkoutStore((s) => s.replaceSheetExercises);

  const initialExercises = sheet
    ? sheetExercises
        .filter((item) => item.sheetId === sheet.id)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          ...item,
          name: exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? "Exercício",
        }))
    : [];

  const [formData, setFormData] = useState({
    name: sheet?.name ?? "",
    description: sheet?.description ?? "",
    selectedExercises: initialExercises,
  });

  const hasExercises = formData.selectedExercises.length > 0;

  const handleChange = ({ target }) => {
    setFormData((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleAddExerciseToArray = (e) => {
    const exerciseId = e.target.value;
    if (!exerciseId) return;

    const exerciseToAdd = exercises.find((ex) => ex.id === exerciseId);
    
    if (exerciseToAdd) {
      setFormData((current) => ({
        ...current,
        selectedExercises: [
          ...current.selectedExercises,
          {
            exerciseId: exerciseToAdd.id,
            name: exerciseToAdd.name,
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 12,
            targetRestSeconds: 60,
          }
        ]
      }));
    }
    e.target.value = "";
  };

  const handleRemoveExercise = (indexToRemove) => {
    setFormData((current) => ({
      ...current,
      selectedExercises: current.selectedExercises.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const sheetData = {
      name: formData.name,
      description: formData.description,
    };
    const sheetId = sheet?.id ?? addSheet(sheetData);

    if (sheet) {
      updateSheet(sheet.id, sheetData);
    }

    replaceSheetExercises(sheetId, formData.selectedExercises);
    
    if (onSubmit) onSubmit(); 
  };

  const labelClassName = "mb-2 block text-sm font-semibold text-slate-800";
  const inputClassName = "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div 
      /* 
        A MÁGICA ESTÁ AQUI: 
        Trocamos 'w-full' por 'w-[1050px]' (com exercícios) ou 'w-[500px]' (sem exercícios).
        O 'max-w-[95vw]' garante que não quebre em celulares.
        Isso força o Modal pai a esticar o fundo branco.
      */
      className={`relative mx-auto transition-all duration-300 ease-in-out bg-white p-6 sm:p-10 shadow-2xl rounded-3xl
        ${hasExercises ? "w-[1050px] max-w-[95vw]" : "w-[500px] max-w-[95vw]"}
      `}
    >
      <button 
        onClick={onCancel}
        className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
        type="button"
        aria-label="Fechar"
      >
        <X size={24} />
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* LADO ESQUERDO */}
          <div className="w-full md:w-[420px] shrink-0 flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                {sheet ? "Editar ficha de treino" : "Nova ficha de treino"}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">Preencha os dados principais e monte a estrutura do treino.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className={labelClassName}>
                  Nome da ficha
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex.: Treino A - Peito e Tríceps"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClassName}>
                  Descrição / Objetivo
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClassName} resize-none`}
                  rows="4"
                  placeholder="Ex.: Foco em progressão de carga (Opcional)"
                />
              </div>
              
              <hr className="border-slate-100 my-2" />

              <div>
                <label htmlFor="exercise-selector" className={labelClassName}>
                  Adicionar Exercício
                </label>
                <select
                  id="exercise-selector"
                  className={inputClassName}
                  defaultValue=""
                  onChange={handleAddExerciseToArray}
                >
                  <option value="" disabled>
                    + Selecione um exercício...
                  </option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* LADO DIREITO */}
          {hasExercises && (
            <div className="flex-1 min-w-[320px] flex flex-col rounded-xl border border-slate-100 bg-[#F8FAFC] p-2 h-full mt-8 md:mt-0">
              <div className="flex items-center gap-2 px-4 py-3 pb-4">
                <Dumbbell size={18} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700">
                  Exercícios na Ficha ({formData.selectedExercises.length})
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto px-2 space-y-3 max-h-[55vh] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pb-2">
                {formData.selectedExercises.map((item, index) => (
                  <div 
                    key={index} 
                    className="group relative flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between pr-6">
                      <span className="text-sm font-bold text-slate-900">
                        {index + 1}. {item.name}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveExercise(index)}
                        className="absolute top-4 right-4 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:!text-red-500"
                        title="Remover exercício"
                        aria-label="Remover exercício"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                       <div className="flex gap-2">
                         <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                           Séries: <strong className="text-slate-900">{item.targetSets}</strong>
                         </span>
                         <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                           Reps: <strong className="text-slate-900">{item.targetRepsMin}-{item.targetRepsMax}</strong>
                         </span>
                       </div>
                       <span className="text-slate-600 text-xs font-medium px-1">
                         Descanso: <strong className="text-slate-900">{item.targetRestSeconds}s</strong>
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
          >
            {sheet ? "Salvar alterações" : "Adicionar ficha"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormFicha;