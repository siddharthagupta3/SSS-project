import React, { useEffect, useState } from 'react';
import api from '../api/client';

const toYouTubeEmbed = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : url;
};

const formatDuration = (seconds) => {
  if (!seconds) return '';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
};

const WatchesPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await api.get('/videos', {
          params: { search: debouncedSearch, page, limit: 12 },
        });
        if (active && res.data.success) {
          setVideos(res.data.data.videos || []);
          setPages(res.data.data.pages || 1);
        }
      } catch (error) {
        if (active) setVideos([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchVideos();
    return () => { active = false; };
  }, [debouncedSearch, page]);

  const isYouTube = (url) => /youtube\.com|youtu\.be/i.test(url || '');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">SHOP.CO Videos</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">Watch & Discover</h1>
      </div>

      <div className="mb-8 mx-auto max-w-xl">
        <input
          type="search"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder="Search videos..."
          className="w-full rounded-full border border-neutral-200 bg-neutral-100 px-5 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-video rounded-2xl bg-neutral-200" />
              <div className="mt-3 h-4 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 py-20 text-center">
          <p className="text-sm font-semibold text-neutral-600">No videos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <article
              key={video._id}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              onClick={() => setActiveVideo(video)}
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-100">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-300">
                    <span className="text-4xl text-neutral-700">▶</span>
                  </div>
                )}
                {video.duration > 0 && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[10px] font-bold text-white">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h2 className="line-clamp-2 font-bold text-neutral-900">{video.title}</h2>
                {video.description && <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{video.description}</p>}
                {video.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {video.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-600">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {[...Array(pages)].slice(0, 8).map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`h-9 w-9 rounded-full text-xs font-bold ${page === index + 1 ? 'bg-black text-white' : 'border border-neutral-200'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {activeVideo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4" onClick={() => setActiveVideo(null)}>
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between bg-white px-4 py-3">
              <h2 className="line-clamp-1 pr-4 text-sm font-bold">{activeVideo.title}</h2>
              <button onClick={() => setActiveVideo(null)} className="h-9 w-9 rounded-full border text-xl">×</button>
            </div>
            <div className="aspect-video">
              {isYouTube(activeVideo.videoUrl) ? (
                <iframe
                  src={toYouTubeEmbed(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={activeVideo.videoUrl} poster={activeVideo.thumbnailUrl || undefined} controls autoPlay className="h-full w-full" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchesPage;
