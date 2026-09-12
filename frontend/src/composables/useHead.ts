import { useSeoHead } from './useSeoHead'

export function useHead(title: string, description: string) {
  useSeoHead({ title, description })
}
