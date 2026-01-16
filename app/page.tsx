import SignatureGenerator from "@/components/signature-generator"

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4 md:py-16 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-float animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/30 blur-3xl animate-float-reverse animate-pulse-soft" />
        <div
          className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-secondary/40 blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        />
      </div>

      <SignatureGenerator />
    </main>
  )
}
