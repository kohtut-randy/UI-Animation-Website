import type { HoldColor, HoldShape } from 'shared/types'

/* Mock data: the wall's full 12-hold set, the count the pinned rail scrubs through. Grades follow the Fontainebleau scale. */
export type Hold = {
  id: string
  name: string
  grade: string
  color: HoldColor
  shape: HoldShape
  setter: string
  /** Wall zone, the way a gym labels its boards. */
  zone: string
  note: string
}

export const HOLDS: readonly Hold[] = [
  {
    id: 'h-01',
    name: 'Chalk Line',
    grade: '6A',
    color: 'jug',
    shape: 'blob-a',
    setter: 'Mara',
    zone: 'Cave',
    note: 'Big holds, bad feet. Start here.',
  },
  {
    id: 'h-02',
    name: 'Tin Roof',
    grade: '6C',
    color: 'crimp',
    shape: 'blob-b',
    setter: 'Ade',
    zone: 'Roof',
    note: 'Everything is a crimp. Everything.',
  },
  {
    id: 'h-03',
    name: 'Slab Logic',
    grade: '6B+',
    color: 'sloper',
    shape: 'blob-c',
    setter: 'Rin',
    zone: 'Slab',
    note: 'No holds, only faith and rubber.',
  },
  {
    id: 'h-04',
    name: 'Pocket Money',
    grade: '7A',
    color: 'pocket',
    shape: 'blob-d',
    setter: 'Mara',
    zone: 'Prow',
    note: 'Two-finger pockets the whole way.',
  },
  {
    id: 'h-05',
    name: 'Purple Patch',
    grade: '6C+',
    color: 'pinch',
    shape: 'blob-e',
    setter: 'Jonah',
    zone: 'Cave',
    note: 'Pinch, breathe, pinch again.',
  },
  {
    id: 'h-06',
    name: 'Volume Up',
    grade: '6A+',
    color: 'volume',
    shape: 'blob-a',
    setter: 'Rin',
    zone: 'Arete',
    note: 'Ride the volume, do not fight it.',
  },
  {
    id: 'h-07',
    name: 'Dyno Sour',
    grade: '7A+',
    color: 'crimp',
    shape: 'blob-c',
    setter: 'Ade',
    zone: 'Roof',
    note: 'One move. You will know which.',
  },
  {
    id: 'h-08',
    name: 'Heel Hook Hymn',
    grade: '6B',
    color: 'jug',
    shape: 'blob-d',
    setter: 'Jonah',
    zone: 'Prow',
    note: 'Heel high, hips in, trust it.',
  },
  {
    id: 'h-09',
    name: 'Sloper Coaster',
    grade: '7B',
    color: 'sloper',
    shape: 'blob-b',
    setter: 'Mara',
    zone: 'Wave',
    note: 'Friction is a state of mind.',
  },
  {
    id: 'h-10',
    name: 'Green Room',
    grade: '6A',
    color: 'pocket',
    shape: 'blob-e',
    setter: 'Rin',
    zone: 'Slab',
    note: 'The friendliest thing on the wall.',
  },
  {
    id: 'h-11',
    name: 'Static Cling',
    grade: '7A',
    color: 'pinch',
    shape: 'blob-a',
    setter: 'Ade',
    zone: 'Wave',
    note: 'Slow is smooth. Smooth is sent.',
  },
  {
    id: 'h-12',
    name: 'Last Light',
    grade: '7C',
    color: 'volume',
    shape: 'blob-c',
    setter: 'Jonah',
    zone: 'Arete',
    note: 'Nobody has flashed this. Yet.',
  },
]
