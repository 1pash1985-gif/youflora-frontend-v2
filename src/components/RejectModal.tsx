'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  initialReason?: string
  title?: string
  templates?: string[]
}

export default function RejectModal({
  open,
  onClose,
  onSubmit,
  initialReason = '',
  title = 'Причина отклонения',
  templates = [
    'Некорректное фото (водяные знаки / коллаж / не тот товар)',
    'Описание не соответствует товару',
    'Неверный SKU / артикул',
    'Дублирование товара',
    'Запрещённая категория / нарушение правил площадки',
  ],
}: Props) {
  const [reason, setReason] = useState(initialReason)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  // Обновлять текст при открытии / смене initialReason
  useEffect(() => { if (open) setReason(initialReason) }, [initialReason, open])

  // Блокируем скролл фона и ставим фокус
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setTimeout(() => areaRef.current?.focus(), 0)
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Esc — закрыть, Ctrl/Cmd+Enter — отправить
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault()
        if (reason.trim()) onSubmit(reason.trim())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, reason, onClose, onSubmit])

  if (!open) return null

  const modal = (
    <>
      {/* overlay */}
      <div className="fixed inset-0 z-[1100] bg-black/40" onClick={onClose} />
      {/* window */}
      <div className="fixed inset-0 z-[1101] flex items-start justify-center p-4 md:p-6 overflow-y-auto">
        <div role="dialog" aria-modal="true" className="bg-white w-full max-w-lg rounded-xl shadow-xl">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="text-lg font-semibold">{title}</div>
            <button aria-label="Закрыть" className="border border-gray-200 rounded-lg px-3 py-1" onClick={onClose}>✕</button>
          </div>

          <div className="p-5 space-y-3">
            <div className="text-sm text-gray-600">Шаблоны причин</div>
            <div className="flex flex-wrap gap-2">
              {templates.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50"
                  onClick={() => setReason(t)}
                  title={t}
                >
                  {t}
                </button>
              ))}
            </div>

            <textarea
              ref={areaRef}
              rows={5}
              className="input w-full"
              placeholder="Например: некорректное фото, требуется перезаливка (без логотипов) и уточнение описания…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-1">
              <button className="border border-gray-200 rounded-lg px-4 py-2" onClick={onClose}>Отмена</button>
              <button
                className="btn-primary px-4 py-2"
                onClick={() => reason.trim() && onSubmit(reason.trim())}
                disabled={!reason.trim()}
                title="Ctrl+Enter — отправить"
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  // Ключевой момент: рендер через портал в body — модалку больше не «режет» ни один контейнер.
  return createPortal(modal, document.body)
}
