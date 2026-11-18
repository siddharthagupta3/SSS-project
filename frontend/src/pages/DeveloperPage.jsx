import React from 'react';
import { developerConfig } from '../config/developer';

const DeveloperPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-shrink-0">
            <img
              src={developerConfig.profileImage}
              alt={developerConfig.name}
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow-2xl border-4 border-white"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 mb-4">
              {developerConfig.name}
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 font-medium mb-4">
              {developerConfig.title}
            </p>
            <p className="text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
              {developerConfig.bio}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={developerConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition"
              >
                GitHub
              </a>
              <a
                href={developerConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
              >
                LinkedIn
              </a>
              <a
                href={`mailto:${developerConfig.social.email}`}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition"
              >
                Email
              </a>
              <a
                href={developerConfig.social.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-600 transition"
              >
                Resume
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mb-8">
          Skills
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {developerConfig.skills.map((skill, index) => (
            <div key={index} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-2">{skill.name}</h3>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-500"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
              <span className="text-xs text-neutral-500 mt-1">{skill.level}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mb-8">
          Project Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {developerConfig.projectFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-3"
            >
              <span className="text-2xl">✓</span>
              <span className="font-medium text-neutral-900">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-200">
        <p className="text-center text-sm text-neutral-500">
          Built by{' '}
          <a
            href={developerConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-900 font-medium hover:underline"
          >
            {developerConfig.name}
          </a>
        </p>
      </div>
    </div>
  );
};

export default DeveloperPage;
