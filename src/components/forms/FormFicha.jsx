import { useState } from "react";
import useExerciseStore from "../../stores/useExerciseStore.js";
import useWorkoutStore from "../../stores/useWorkoutStore.js";
import { X, Trash2, Dumbbell, Plus } from "lucide-react";
import { FormExerciseModal } from "../exercises/FormExerciseModal.jsx";

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

  const [isExModalOpen, setIsExModalOpen] = useState(false);

  const hasExercises = formData.selectedExercises.length > 0;

  const handleChange = ({ target }) => {
    setFormData((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleAddExerciseToArray = (e) => {
    const exerciseId = e.target.value;
    if (!exerciseId) return;
    addExerciseById(exerciseId);
    e.target.value = "";
  };

  const addExerciseById = (exerciseId) => {
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
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData((current) => {
      const newExercises = [...current.selectedExercises];
      newExercises[index] = { ...newExercises[index], [field]: Number(value) };
      return { ...current, selectedExercises: newExercises };
    });
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

  const labelClassName = "mb-2 block text-sm font-semibold text-text-primary";
  const inputClassName = "w-full rounded-lg border border-brand-elevated bg-brand-base px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-action focus:ring-2 focus:ring-brand-action/20";
  const inlineInputClassName = "w-12 h-7 bg-brand-base border border-brand-elevated rounded text-center text-sm text-text-primary outline-none focus:border-brand-action transition-all";

  return (
    <>
      <div 
        className={`relative mx-auto transition-all duration-300 ease-in-out bg-brand-surface border border-brand-elevated p-6 sm:p-10 shadow-2xl rounded-3xl
          ${hasExercises ? "w-[1050px] max-w-[95vw]" : "w-[500px] max-w-[95vw]"}
        `}
      >
        <button 
          onClick={onCancel}
          className="absolute right-6 top-6 text-text-muted hover:text-text-primary transition-colors"
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
                <h2 className="text-2xl font-bold text-text-primary">
                  {sheet ? "Editar ficha de treino" : "Nova ficha de treino"}
                </h2>
                <p className="mt-1.5 text-sm text-text-secondary">Preencha os dados principais e monte a estrutura do treino.</p>
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
                
                <hr className="border-brand-elevated my-2" />

                <div>
                  <label htmlFor="exercise-selector" className={labelClassName}>
                    Adicionar Exercício
                  </label>
                  <select
                    id="exercise-selector"
                    className={inputClassName}
                    value=""
                    onChange={handleAddExerciseToArray}
                  >
                    <option value="" disabled>
                      + Selecione um exercício da lista...
                    </option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsExModalOpen(true)}
                    className="mt-3 flex items-center justify-center gap-2 w-full border border-dashed border-brand-action/50 text-brand-action bg-brand-action/5 hover:bg-brand-action/10 hover:border-brand-action font-bold text-sm py-2.5 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Criar Novo Exercício (Não encontrou?)
                  </button>
                </div>
              </div>
            </div>

            {/* LADO DIREITO */}
            {hasExercises && (
              <div className="flex-1 min-w-[320px] flex flex-col rounded-xl border border-brand-elevated bg-brand-base p-2 h-full mt-8 md:mt-0">
                <div className="flex items-center gap-2 px-4 py-3 pb-4">
                  <Dumbbell size={18} className="text-text-muted" />
                  <h3 className="text-sm font-semibold text-text-primary">
                    Exercícios na Ficha ({formData.selectedExercises.length})
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto px-2 space-y-3 max-h-[55vh] custom-scrollbar pb-2">
                  {formData.selectedExercises.map((item, index) => (
                    <div 
                      key={index} 
                      className="group relative flex flex-col gap-3 rounded-xl border border-brand-elevated bg-brand-surface p-4 shadow-sm transition-all hover:border-brand-action"
                    >
                      <div className="flex items-start justify-between pr-6">
                        <span className="text-sm font-bold text-text-primary">
                          {index + 1}. {item.name}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveExercise(index)}
                          className="absolute top-4 right-4 text-text-muted opacity-0 transition group-hover:opacity-100 hover:!text-red-500"
                          title="Remover exercício"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                         <label className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                           Séries:
                           <input type="number" min="1" max="20" className={inlineInputClassName} value={item.targetSets} onChange={(e) => handleExerciseChange(index, 'targetSets', e.target.value)} />
                         </label>
                         
                         <label className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                           Reps:
                           <div className="flex items-center gap-1">
                             <input type="number" min="1" className={inlineInputClassName} value={item.targetRepsMin} onChange={(e) => handleExerciseChange(index, 'targetRepsMin', e.target.value)} />
                             <span>a</span>
                             <input type="number" min="1" className={inlineInputClassName} value={item.targetRepsMax} onChange={(e) => handleExerciseChange(index, 'targetRepsMax', e.target.value)} />
                           </div>
                         </label>
                         
                         <label className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                           Descanso (s):
                           <input type="number" step="15" min="0" className={inlineInputClassName} value={item.targetRestSeconds} onChange={(e) => handleExerciseChange(index, 'targetRestSeconds', e.target.value)} />
                         </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-brand-elevated">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-6 py-2.5 text-sm font-bold text-text-secondary hover:bg-brand-elevated transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-action px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-highlight transition shadow-sm"
            >
              {sheet ? "Salvar alterações" : "Adicionar ficha"}
            </button>
          </div>
        </form>
      </div>

      <FormExerciseModal 
        isOpen={isExModalOpen} 
        onClose={() => setIsExModalOpen(false)} 
        onCreated={(newExId) => addExerciseById(newExId)}
      />
    </>
  );
};

export default FormFicha;