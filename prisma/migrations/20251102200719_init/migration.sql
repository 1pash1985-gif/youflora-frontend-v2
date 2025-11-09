-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('AVAILABLE', 'PREORDER', 'IN_TRANSIT');

-- CreateEnum
CREATE TYPE "ModerationType" AS ENUM ('NEW_PRODUCT', 'EDIT_PRODUCT');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_SELLER_CONFIRMATION', 'SELLER_CONFIRMED', 'PAID', 'FULFILLED', 'CANCELLED', 'CANCELLED_EXPIRED');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "SupportActor" AS ENUM ('SELLER', 'BUYER', 'ADMIN');

-- CreateTable
CREATE TABLE "sellers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "commissionPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "pricePerBoxSeller" INTEGER NOT NULL,
    "stemsPerBox" INTEGER NOT NULL,
    "cutLengthCm" INTEGER NOT NULL,
    "color" TEXT,
    "country" TEXT,
    "photos" JSONB NOT NULL,
    "stockStatus" "StockStatus" NOT NULL DEFAULT 'AVAILABLE',
    "sellerDiscountRub" INTEGER NOT NULL DEFAULT 0,
    "sellerCashbackRub" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderations" (
    "id" TEXT NOT NULL,
    "type" "ModerationType" NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "sellerId" TEXT NOT NULL,
    "productId" TEXT,
    "draft" JSONB NOT NULL,
    "original" JSONB,
    "fieldsChanged" TEXT[],
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "moderations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qtyBoxes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("warehouseId","productId")
);

-- CreateTable
CREATE TABLE "market_commissions" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "sellerId" TEXT,
    "categoryId" TEXT,
    "percent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_cashbacks" (
    "id" TEXT NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_cashbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "qtyBoxes" INTEGER NOT NULL,
    "priceRub" INTEGER NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_groups" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_SELLER_CONFIRMATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmBy" TIMESTAMP(3) NOT NULL,
    "totalRub" INTEGER NOT NULL,
    "cashbackRub" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "order_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderGroupId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qtyBoxes" INTEGER NOT NULL,
    "priceRub" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'NEW',
    "topic" TEXT NOT NULL,
    "requesterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3),

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorKind" "SupportActor" NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "carts_buyerId_idx" ON "carts"("buyerId");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE INDEX "order_groups_buyerId_idx" ON "order_groups"("buyerId");

-- CreateIndex
CREATE INDEX "order_groups_sellerId_idx" ON "order_groups"("sellerId");

-- CreateIndex
CREATE INDEX "order_items_orderGroupId_idx" ON "order_items"("orderGroupId");

-- CreateIndex
CREATE INDEX "banners_isActive_sortOrder_idx" ON "banners"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "support_tickets_status_lastMessageAt_idx" ON "support_tickets"("status", "lastMessageAt");

-- CreateIndex
CREATE INDEX "support_messages_ticketId_idx" ON "support_messages"("ticketId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderations" ADD CONSTRAINT "moderations_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderations" ADD CONSTRAINT "moderations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_groups" ADD CONSTRAINT "order_groups_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderGroupId_fkey" FOREIGN KEY ("orderGroupId") REFERENCES "order_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
