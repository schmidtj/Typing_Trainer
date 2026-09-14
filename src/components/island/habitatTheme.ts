import { HabitatId } from '../../types/island';

export const HABITAT_SCENE: Record<
  HabitatId,
  { gradient: string; arenaGradient: string; ground: string }
> = {
  meadow: {
    gradient: 'from-sky-200 via-lime-100 to-amber-100',
    arenaGradient: 'from-sky-100 via-sky-50 to-emerald-100',
    ground: 'from-emerald-300 via-emerald-200 to-transparent',
  },
  forest_treehouse: {
    gradient: 'from-amber-200 via-orange-100 to-emerald-200',
    arenaGradient: 'from-amber-100 via-orange-50 to-green-100',
    ground: 'from-amber-400 via-lime-200 to-transparent',
  },
  crystal_pond: {
    gradient: 'from-sky-200 via-cyan-100 to-teal-100',
    arenaGradient: 'from-cyan-100 via-sky-50 to-teal-100',
    ground: 'from-teal-300 via-cyan-200 to-transparent',
  },
  bamboo_grove: {
    gradient: 'from-lime-200 via-green-100 to-emerald-200',
    arenaGradient: 'from-lime-100 via-green-50 to-emerald-100',
    ground: 'from-lime-400 via-green-200 to-transparent',
  },
  snowy_peak: {
    gradient: 'from-slate-100 via-sky-50 to-indigo-100',
    arenaGradient: 'from-slate-100 via-sky-50 to-indigo-100',
    ground: 'from-indigo-200 via-slate-100 to-transparent',
  },
  fairy_hollow: {
    gradient: 'from-violet-200 via-fuchsia-100 to-indigo-200',
    arenaGradient: 'from-violet-100 via-fuchsia-50 to-indigo-100',
    ground: 'from-fuchsia-300 via-violet-200 to-transparent',
  },
};
