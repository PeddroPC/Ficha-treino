// ============================================================
// mocks/profile.js — Dados semente do Perfil do usuário
// ============================================================
import { Goal } from '../constants/enums.js'

/** @type {import('../types').Profile} */
export const seedProfile = {
  id: 'profile-001',
  name: 'Pedro',
  avatarUrl: null,
  birthDate: '1995-05-20',
  weightKg: 80.0,
  heightCm: 178,
  goal: Goal.HYPERTROPHY,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}
