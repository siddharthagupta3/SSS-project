import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { serviceDetails } from '../service-details';

const categoryStyles = {
  Company: 'from-amber-400 to-orange-500',
  Help: 'from-neutral-800 to-neutral-950',
  FAQ: 'from-sky-500 to-indigo-600',
};

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const detail = serviceDetails[slug];

  if (!detail) {
    return (
      <main className="relative min-h-[70vh] overflow-hidden px-4 py-20">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-neutral-200 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">404 / SHOP.CO</p>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight">Page Not Found</h1>
          <Link to="/" className="mt-7 inline-flex rounded-full bg-black px-7 py-3 text-sm font-bold text-white shadow-xl shadow-neutral-300 transition hover:-translate-y-1">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const accent = categoryStyles[detail.category] || categoryStyles.Company;

  return (
    <main className="relative isolate min-h-[75vh] overflow-hidden bg-neutral-100/70 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-neutral-300/60 blur-3xl" />
      <div className="pointer-events-none absolute left-[12%] top-16 h-24 w-24 rotate-12 rounded-3xl border border-white/70 bg-white/20 backdrop-blur-sm" />

      <div className="relative mx-auto max-w-5xl">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 shadow-lg shadow-neutral-200/60 backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-black"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Back to SHOP.CO
        </Link>

        <article className="mt-5 overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <header className={`relative overflow-hidden bg-gradient-to-br ${accent} px-6 py-9 text-white sm:px-10 sm:py-12`}>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 20% 20%, white 0 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }} />
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-white/10" />
            <div className="absolute bottom-[-5rem] right-24 h-40 w-40 rotate-45 rounded-[2.5rem] border border-white/20 bg-white/10 backdrop-blur-md" />

            <div className="relative max-w-3xl">
              <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur-md">
                {detail.category}
              </span>
              <h1 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] sm:text-6xl">
                {detail.title}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                {detail.intro}
              </p>
            </div>
          </header>

          <div className="px-5 py-6 sm:px-10 sm:py-10">
            <div className="grid gap-4 md:grid-cols-2">
              {detail.sections.map(([heading, text], index) => (
                <section
                  key={heading}
                  className="group relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-white to-neutral-50 p-5 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_22px_45px_-18px_rgba(0,0,0,0.32)] sm:p-6"
                  style={{ perspective: '1000px' }}
                >
                  <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${accent}`} />
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-sm font-black text-neutral-700 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className="text-base font-black text-neutral-900 sm:text-lg">{heading}</h2>
                      {heading === 'Support email' ? (
                        <a
                          href="mailto:supportdeveloper.sid@gmail.com"
                          className="mt-2 inline-block text-sm font-bold leading-7 text-neutral-900 underline decoration-amber-400 decoration-2 underline-offset-4"
                        >
                          supportdeveloper.sid@gmail.com
                        </a>
                      ) : (
                        <p className="mt-2 text-sm leading-7 text-neutral-600">{text}</p>
                      )}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl border border-neutral-200 bg-neutral-950 p-5 text-white shadow-[0_20px_45px_-20px_rgba(0,0,0,0.55)] sm:flex-row sm:items-center sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">Need more help?</p>
                <p className="mt-1 text-sm font-semibold">Explore another SHOP.CO service.</p>
              </div>
              <Link
                to="/info/customer-support"
                className="rounded-full bg-white px-5 py-2.5 text-xs font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                Customer Support
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
};

export default ServiceDetailPage;
