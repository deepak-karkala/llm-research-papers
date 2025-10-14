export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="max-w-2xl text-center space-y-6 px-6">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to LLM Map Explorer
        </h1>
        <p className="text-lg text-slate-300">
          This Next.js 14 + TypeScript starter is ready for feature development. Edit{' '}
          <code className="rounded bg-slate-800 px-1">src/app/page.tsx</code> to begin building the
          experience.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-700 px-4 py-2 transition hover:bg-slate-800"
          >
            Read Next.js Docs
          </a>
          <a
            href="https://tailwindcss.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-700 px-4 py-2 transition hover:bg-slate-800"
          >
            TailwindCSS Guide
          </a>
        </div>
      </div>
    </main>
  );
}
