'use client'
export function DataTable({ columns, rows }:{ columns:{key:string; label:string; render?:(v:any,row:any)=>React.ReactNode}[], rows:any[]}) {
  return (
    <div className="overflow-x-auto card">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(c => (<th key={c.key} className="text-left px-4 py-3 font-semibold">{c.label}</th>))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t">
              {columns.map(c => (
                <td key={c.key} className="px-4 py-2">{c.render ? c.render(r[c.key], r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
