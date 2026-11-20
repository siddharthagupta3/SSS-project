import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { developerConfig } from '../config/developer';

const DeveloperPage = () => {
  const titles = ['Full-Stack MERN Developer', 'UI/UX Engineer', 'E-Commerce Builder'];
  const [titleIndex, setTitleIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const fullTitle = titles[titleIndex];
    const timeout = window.setTimeout(() => {
      if (!deleting) {
        setTypedTitle(fullTitle.slice(0, typedTitle.length + 1));
        if (typedTitle.length + 1 === fullTitle.length) setDeleting(true);
      } else {
        setTypedTitle(fullTitle.slice(0, Math.max(0, typedTitle.length - 1)));
        if (typedTitle.length <= 1) {
          setDeleting(false);
          setTitleIndex((current) => (current + 1) % titles.length);
        }
      }
    }, deleting ? 35 : 65);
    return () => window.clearTimeout(timeout);
  }, [typedTitle, deleting, titleIndex]);

  const reveal = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] text-white">
      <motion.div className="fixed left-0 top-0 z-[70] h-1 origin-left bg-violet-500" style={{ scaleX }} />
      <div className="pointer-events-none absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-10rem] top-[25rem] h-[25rem] w-[25rem] rounded-full bg-cyan-500/10 blur-[120px]" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-[0.75fr_1.25fr]">
          <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mx-auto">
            {/* Add Profile Photo Here */}
            <div className="flex h-64 w-64 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-[0_25px_100px_rgba(124,58,237,0.18)] backdrop-blur-xl sm:h-72 sm:w-72" aria-label="Developer profile photo placeholder" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-violet-400">Portfolio / 2026</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">{developerConfig.name}</h1>
            <p className="mt-5 min-h-8 text-lg font-semibold text-neutral-300 sm:text-2xl">
              {typedTitle}<span className="ml-1 inline-block h-6 w-0.5 animate-pulse bg-violet-400 align-middle" />
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-400">{developerConfig.bio}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                ['GitHub', developerConfig.social.github],
                ['LinkedIn', developerConfig.social.linkedin],
                ['Portfolio', developerConfig.social.portfolio],
              ].map(([label, href]) => (
                <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" whileHover={{ y: -4, scale: 1.03 }} className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold backdrop-blur-xl hover:border-violet-400/60 hover:bg-violet-500/10">
                  {label}
                </motion.a>
              ))}
              <motion.a href={`mailto:${developerConfig.social.email}`} whileHover={{ y: -4, scale: 1.03 }} className="rounded-full bg-violet-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20">Email Me</motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section {...reveal} transition={{ duration: 0.65 }} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-400">Capabilities</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Technical Skills</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {developerConfig.skills.map((skill, index) => (
            <motion.div key={skill.name} {...reveal} transition={{ duration: 0.5, delay: index * 0.05 }} whileHover={{ y: -8, borderColor: 'rgba(167,139,250,0.5)' }} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between"><h3 className="font-bold">{skill.name}</h3><span className="text-xs text-neutral-500">{skill.level}%</span></div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.15 }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section {...reveal} transition={{ duration: 0.65 }} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-400">Selected Work</p>
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">SHOP.CO Features</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {developerConfig.projectFeatures.map((feature, index) => (
            <motion.div key={feature} {...reveal} transition={{ duration: 0.5, delay: index * 0.04 }} whileHover={{ y: -6, scale: 1.01 }} className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 group-hover:bg-violet-500 group-hover:text-white">✓</span>
              <p className="mt-5 font-bold text-neutral-200">{feature}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Add Resume PDF Link/Button Here */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-label="Resume placeholder" />

      <footer className="border-t border-white/10 py-10 text-center text-sm text-neutral-500">
        Designed &amp; built by <a href={developerConfig.social.github} target="_blank" rel="noreferrer" className="font-bold text-white hover:text-violet-400">{developerConfig.name}</a>
      </footer>
    </main>
  );
};

export default DeveloperPage;
