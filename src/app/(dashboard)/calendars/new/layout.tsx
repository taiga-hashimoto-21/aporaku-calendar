export default function NewCalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 min-h-[calc(100vh-4.5rem)]">
        {children}
      </div>
    </div>
  );
}
