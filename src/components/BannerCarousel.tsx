import prisma from "@/lib/prisma"

export default async function BannerCarousel() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    if (!banners?.length) return null

    return (
      <div className="relative overflow-hidden rounded-lg border">
        <div className="flex gap-3 p-3 overflow-auto">
          {banners.map((b) => (
            <a key={b.id} href={b.linkUrl || "#"} className="block min-w-[280px] md:min-w-[420px]" title={b.title || ""}>
              <img src={b.imageUrl || "/placeholder-banner.jpg"} alt={b.title || "banner"} className="w-full h-48 object-cover rounded" />
              {(b.title || b.subtitle) && (
                <div className="mt-2">
                  {b.title && <div className="font-medium">{b.title}</div>}
                  {b.subtitle && <div className="text-sm text-gray-500">{b.subtitle}</div>}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    )
  } catch {
    return null
  }
}
