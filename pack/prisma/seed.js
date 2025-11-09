// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function run() {
  const cfg = await prisma.marketplaceConfig.upsert({
    where: { id: 'main' },
    create: { id: 'main', globalCommissionPercent: 10, globalCashbackPercent: 1.5, confirmHoldMinutes: 120 },
    update: {}
  })

  const seller = await prisma.seller.upsert({
    where: { id: 's-ec' },
    create: { id: 's-ec', name: 'EcoFlowers LLC', taxId: '7700000000', commissionPercent: 8 },
    update: {},
  })
  const buyer = await prisma.buyer.upsert({
    where: { id: 'b-demo' },
    create: { id: 'b-demo', email: 'buyer@demo.local', name: 'Demo Buyer' },
    update: {},
  })
  const cat = await prisma.category.upsert({
    where: { id: 'cat-roses' },
    create: { id: 'cat-roses', name: 'Розы' },
    update: {},
  })
  const city = await prisma.city.upsert({
    where: { id: 'city-moscow' },
    create: { id: 'city-moscow', name: 'Москва', sellerId: seller.id },
    update: {},
  })
  const wh = await prisma.warehouse.upsert({
    where: { id: 'wh-1' },
    create: { id: 'wh-1', sellerId: seller.id, cityId: city.id, name: 'Склад №1' },
    update: {},
  })
  const p1 = await prisma.product.upsert({
    where: { id: 'p-demo-1' },
    create: {
      id: 'p-demo-1',
      sellerId: seller.id, categoryId: cat.id,
      name: 'Роза Freedom 60 см', sku: 'FR60',
      pricePerBoxSeller: 8000, stemsPerBox: 300, cutLengthCm: 60, country: 'Эквадор',
      photos: ['/images/placeholder.png'],
      sellerCashbackRub: 100, sellerDiscountRub: 0,
    },
    update: {},
  })
  await prisma.stock.upsert({
    where: { warehouseId_productId: { warehouseId: wh.id, productId: p1.id } },
    create: { warehouseId: wh.id, productId: p1.id, qty: 20, status: 'AVAILABLE' },
    update: { qty: 20, status: 'AVAILABLE' },
  })

  const cart = await prisma.cart.upsert({
    where: { buyerId: buyer.id },
    create: { buyerId: buyer.id },
    update: {},
  })
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: p1.id } },
    create: { cartId: cart.id, productId: p1.id, qty: 2 },
    update: { qty: 2 },
  })

  console.log('Seed complete')
}
run().finally(() => prisma.$disconnect())
