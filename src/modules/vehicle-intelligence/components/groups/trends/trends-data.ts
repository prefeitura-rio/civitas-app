import type { GroupProfileData } from '@/modules/vehicle-intelligence/types/groups'

/** O que as tendências usam: os ROs (dia, hora, dia da semana, placas) e as contagens prontas; serve ao grupo e ao território. */
export type TrendsData = Pick<GroupProfileData, 'events' | 'trends'>
