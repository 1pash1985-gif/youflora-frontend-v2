import SellerSidebar from '@/components/SellerSidebar'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        <SellerSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
