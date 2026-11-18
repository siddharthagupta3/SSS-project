import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { serviceDetails } from '../service-details';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const detail = serviceDetails[slug];

  if (!detail) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black uppercase">Page Not Found</h1>
        <Link to="/" className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Back to Home</Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to="/" className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black">← Back to SHOP.CO</Link>
      <div className="mt-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">{detail.category}</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">{detail.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">{detail.intro}</p>
        <div className="mt-8 space-y-4">
          {detail.sections.map(([heading, text]) => (
            <section key={heading} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
              <h2 className="text-sm font-bold text-neutral-900 sm:text-base">{heading}</h2>
              <p className="mt-2 text-sm leading-7 text-neutral-600">{text}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ServiceDetailPage;
