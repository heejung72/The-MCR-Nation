import { supabaseConfigured } from '../lib/supabaseRest'
import { createLocalRepository } from './localRepository'
import type { Repository } from './repository'
import { createSupabaseRepository } from './supabaseRepository'

export type { BracketResult, NewPost, OpeningResult, PredictionResult, ReportTarget, Repository } from './repository'

/** .env.local에 Supabase 값이 있으면 서버 저장소, 없으면 브라우저 저장소를 쓴다. */
export const createRepository = (): Repository => supabaseConfigured ? createSupabaseRepository() : createLocalRepository()
