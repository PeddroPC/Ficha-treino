import { useState } from "react";
import {
  Equipment,
  EquipmentLabel,
  MuscleGroup,
  MuscleGroupLabel,
} from "../../constants/enums.js";

const inputClassName =
  "w-full rounded-lg border border-brand-elevated bg-brand-base px-3 py-2 text-sm text-text-primary outline-none transition focus:border-brand-action focus:ring-2 focus:ring-brand-action/20";

const FormExercise = ({ exercise = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => ({
    name: exercise?.name ?? "",
    muscleGroup: exercise?.muscleGroup ?? "",
    equipment: exercise?.equipment ?? "",
    instructions: exercise?.instructions ?? "",
  }));

  const handleChange = ({ target }) => {
    setFormData((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="exercise-name"
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          Nome do exercício
        </label>
        <input
          id="exercise-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inputClassName}
          placeholder="Ex.: Supino reto com barra"
          required
          autoFocus
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="exercise-muscle-group"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Grupo muscular
          </label>
          <select
            id="exercise-muscle-group"
            name="muscleGroup"
            value={formData.muscleGroup}
            onChange={handleChange}
            className={inputClassName}
            required
          >
            <option value="">Selecione</option>
            {Object.values(MuscleGroup).map((value) => (
              <option key={value} value={value}>
                {MuscleGroupLabel[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="exercise-equipment"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Equipamento
          </label>
          <select
            id="exercise-equipment"
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
            className={inputClassName}
            required
          >
            <option value="">Selecione</option>
            {Object.values(Equipment).map((value) => (
              <option key={value} value={value}>
                {EquipmentLabel[value]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="exercise-instructions"
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          Instruções
        </label>
        <textarea
          id="exercise-instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          className={`${inputClassName} min-h-24 resize-y`}
          placeholder="Descreva como executar o exercício"
          rows="4"
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-brand-elevated pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-brand-elevated"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-brand-action px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-highlight"
        >
          {exercise ? "Salvar alterações" : "Adicionar exercício"}
        </button>
      </div>
    </form>
  );
};

export default FormExercise;
