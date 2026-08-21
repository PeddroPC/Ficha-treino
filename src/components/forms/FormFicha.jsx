import { useState } from "react";
import useExerciseStore from "../../stores/useExerciseStore.js";
import useWorkoutStore from "../../stores/useWorkoutStore.js";
import { Card } from "../ui/Card.jsx";


const FormFicha = ({ exercise = null, onSubmit, onCancel }) => {
  const exercises = useExerciseStore((s) => s.exercises);
  const addSheet = useWorkoutStore((s) => s.addSheet);
  const updateSheet = useWorkoutStore((s) => s.updateSheet);
  const removeSheet = useWorkoutStore((s) => s.removeSheet);

  const [formData, setFormData] = useState(() => ({
    name: exercise?.name ?? "",
    description: exercise?.description ?? "",
    exercises: exercise?.exercises ?? [],
  }));

  const handleChange = ({ target }) => {
    setFormData((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newSheetId = Date.now();
    addSheet({
      id: newSheetId,
      name: formData.name,
      description: formData.description,
      exercises: formData.exercises,
    });
    selectExercises.forEach((ex, index) => {
      addSheetExercise({
        sheetId: newSheetId,
        exerciseId: item.exerciseId,
        order: index + 1,
        targetSets: item.targetSets,
        targetRepsMin: item.targetRepsMin,
        targetRepsMax: item.targetRepsMax,
        targetRestSeconds: item.targetRestSeconds,
        notes: item.notes ?? "",
      });
    });
    onClose();
  };

  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. CABEÇALHO DA FICHA */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Nome da ficha
          </label>
          <input
            id="name"
            name="name" // Alimenta formData.name
            value={formData.name}
            onChange={handleChange}
            className={inputClassName}
            placeholder="Ex.: Treino A - Peito e Tríceps"
            required
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Descrição / Objetivo
          </label>
          <textarea
            id="description"
            name="description" // Alimenta formData.description
            value={formData.description}
            onChange={handleChange}
            className={inputClassName}
            rows="2"
            placeholder="Ex.: Foco em progressão de carga (Opcional)"
          />
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* 2. ÁREA DE INSERÇÃO DE EXERCÍCIOS */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-900">
          Composição do Treino
        </h3>

        {/* Este select NÃO usa o handleChange padrão. Ele servirá como um gatilho 
        para adicionar um exercício ao array formData.exercises */}
        <select
          id="exercise-selector"
          className={inputClassName}
          defaultValue=""
          // onChange={handleAddExerciseToArray} -> Você precisará criar esta função
        >
          <option value="" disabled>
            + Selecione um exercício para adicionar...
          </option>

          {/* Aqui você mapeia os exercícios reais vindos do seu store */}
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        {/* Aqui embaixo você fará um map do formData.exercises para mostrar 
        as linhas com Séries, Repetições e Descanso de cada exercício adicionado */} 
      </div>

      {/* ... (Seus botões de Salvar e Cancelar ficam aqui embaixo) ... */}

    </form>
  );
};

export default FormFicha;
