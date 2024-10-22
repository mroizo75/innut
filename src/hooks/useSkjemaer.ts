// src/hooks/useSkjemaer.ts
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { Skjema } from '@/types/api';

export const useSkjemaer = () => {
  const { data, error, mutate } = useSWR<Skjema[]>('/api/archived-skjemaer', fetcher);
  return {
    skjemaer: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};