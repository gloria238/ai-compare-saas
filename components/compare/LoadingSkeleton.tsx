export default function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  )
}