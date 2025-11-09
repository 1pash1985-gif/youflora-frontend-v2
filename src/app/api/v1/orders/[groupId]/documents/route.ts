import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

function renderInvoiceHTML(data: any) {
  const rows = data.items.map((it:any, idx:number) =>
    `<tr><td>${idx+1}</td><td>${it.product.name}</td><td>${it.qtyBoxes}</td><td>${it.priceRub}</td><td>${it.qtyBoxes*it.priceRub}</td></tr>`
  ).join('')
  return `<!doctype html><meta charset="utf-8"/>
  <style>body{font:14px/1.4 system-ui} table{border-collapse:collapse;width:100%} td,th{border:1px solid #ddd;padding:6px}</style>
  <h2>Счёт № ${data.group.id} от ${new Date().toLocaleDateString('ru-RU')}</h2>
  <p>Поставщик: ${data.seller.name} (ИНН ${data.seller.taxId||'—'})</p>
  <p>Покупатель: ${data.buyer.companyName || data.buyer.name || data.buyer.email}</p>
  <table><thead><tr><th>№</th><th>Товар</th><th>Кол-во коробок</th><th>Цена, ₽</th><th>Сумма, ₽</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <p style="text-align:right;font-weight:600">Итого: ${data.group.totalRub} ₽</p>
  <p>Документ тестовый (без УНП/ЭДО), предназначен для демонстрации потока документов.</p>`
}

export async function GET(_: Request, { params }:{ params:{ groupId:string } }) {
  const group = await prisma.orderGroup.findUnique({
    where: { id: params.groupId },
    include: {
      seller: true,
      buyer: true,
      items: { include: { product: true } }
    }
  })
  if (!group) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const html = renderInvoiceHTML({ group, seller: group.seller, buyer: group.buyer, items: group.items })
  const dir = path.join(process.cwd(), 'public', 'docs')
  fs.mkdirSync(dir, { recursive: true })
  const file = `invoice-${group.id}.html`
  fs.writeFileSync(path.join(dir, file), html, 'utf8')
  return NextResponse.json({ invoiceUrl: `/docs/${file}` })
}
