import BannerCarousel from "@/components/BannerCarousel"

export default async function HomePage() {
  return (
    <div className="p-6 space-y-8">
      <BannerCarousel />
      {/* здесь ваши секции каталога */}
    </div>
  )
}
