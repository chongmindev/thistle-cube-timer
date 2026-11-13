import { useMemo } from 'react'
import { formatMs, formatSolve } from '../lib/format'
import { rolling, type Solve } from '../lib/stats'
import { Shape } from './Shape'

/** Newest first, with the ao5 and ao12 that ended on each solve. */
export function TimesList({
  solves,
  decimals,
  onOpen,
  onOpenAverage,
}: {
  solves: Solve[]
  decimals: number
  onOpen: (id: string) => void
  /** The average of `size` solves ending at solve `end` (an index). */
  onOpenAverage: (end: number, size: number) => void
}) {
  const avgCell = (value: number | null, end: number, size: number) =>
    value === null ? (
      formatMs(value, decimals)
    ) : (
      <button className="times-avg" onClick={() => onOpenAverage(end, size)} aria-label={`ao${size} ending at solve ${end + 1}`}>
        {formatMs(value, decimals)}
      </button>
    )

  const ao5 = useMemo(() => rolling(solves, 5), [solves])
  const ao12 = useMemo(() => rolling(solves, 12), [solves])

  return (
    <table className="times">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Time</th>
          <th scope="col">ao5</th>
          <th scope="col">ao12</th>
        </tr>
      </thead>
      <tbody>
        {solves
          .map((s, i) => (
            <tr key={s.id}>
              <td className="times-index">{i + 1}</td>
              <td>
                <button className="times-time" onClick={() => onOpen(s.id)}>
                  {s.penalty !== 'none' && <Shape kind="square" className="red" />}
                  {formatSolve(s, decimals)}
                </button>
              </td>
              <td>{avgCell(ao5[i], i, 5)}</td>
              <td>{avgCell(ao12[i], i, 12)}</td>
            </tr>
          ))
          .reverse()}
      </tbody>
    </table>
  )
}
