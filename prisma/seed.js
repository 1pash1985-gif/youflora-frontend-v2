const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

async function ensureDemoBannerFile() {
  const dir = path.join(process.cwd(), 'public', 'uploads', 'banners')
  fs.mkdirSync(dir, { recursive: true })
  const dst = path.join(dir, 'demo-rose.jpg')
  if (!fs.existsSync(dst)) {
    fs.copyFileSync(
      path.join(__dirname, 'demo-assets', 'demo-rose.jpg'),
      dst
    )
  }
  return '/uploads/banners/demo-rose.jpg'
}

async function main() {
  if (!(await prisma.globalCashback.findFirst())) {
    await prisma.globalCashback.create({ data: { percent: 1.5 } })
  }

  const seller = await prisma.seller.upsert({
    where: { id: 's-ec' },
    update: {},
    create: { id: 's-ec', name: 'EcoFlowers', taxId: '7700000000' }
  })

  const buyer = await prisma.buyer.upsert({
    where: { email: 'buyer@demo.local' },
    update: {},
    create: {
      email: 'buyer@demo.local',
      name: 'Демо Покупатель',
      companyName: 'ООО «Демо»'
    }
  })

  const cats = []
  for (const name of ['Розы', 'Хризантемы', 'Тюльпаны']) {
    cats.push(await prisma.category.upsert({
      where: { name }, update: {}, create: { name }
    }))
  }

  if (!(await prisma.product.findFirst())) {
    await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: cats[0].id,
        name: 'Роза Freedom 60 см',
        sku: 'FREEDOM-60',
        description: 'Классическая красная роза, срез 60 см.',
        pricePerBoxSeller: 3500,
        stemsPerBox: 300,
        cutLengthCm: 60,
        color: 'красный',
        country: 'Эквадор',
        photos: ['https://via.placeholder.com/800x800.png?text=Freedom']
      }
    })
  }

  const imgUrl = await ensureDemoBannerFile()
  if (!(await prisma.banner.findFirst())) {
    await prisma.banner.create({
      data: {
        title: 'Свежие розы',
        imageUrl: imgUrl,
        linkUrl: '/',
        isActive: true,
        sortOrder: 0
      }
    })
  }

  // г. Москва / Склад #1
  const city = await prisma.city.create({ data: { sellerId: seller.id, name: 'Москва' } })
  await prisma.warehouse.create({ data: { sellerId: seller.id, cityId: city.id, name: 'Склад #1' } })

  console.log('✓ Seller:', seller.name, '✓ Buyer:', buyer.email)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error('Seed error:', e); await prisma.$disconnect(); process.exit(1) })
