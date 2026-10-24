'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Track {
  id: string
  title: string
  artist: string
  type: string
  duration: string
  audioUrl: string
}

interface Stage {
  id: string
  name: string
  currentBand: string
  votes: number
}

interface Merchandise {
  id: string
  brand: string
  title: string
  price: string
  discountPrice: string
  stock: number
  claimed: number
  code: string
  image: string
}

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('video')
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

  const tracks: Track[] = [
    {
      id: 't1',
      title: 'Jakarta Hari Ini (Live at JakCloth)',
      artist: 'For Revenge',
      type: 'Live',
      duration: '04:12',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: 't2',
      title: 'Sudut Kota (Studio Rec)',
      artist: 'The Overdue (Band Pembuka 2025)',
      type: 'Studio (Kompilasi JakCloth)',
      duration: '03:45',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
      id: 't3',
      title: 'Malam Tanpa Suara (Studio Rec)',
      artist: 'Anak Senja (Band Pembuka 2025)',
      type: 'Studio (Kompilasi JakCloth)',
      duration: '03:10',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
      id: 't4',
      title: 'Berlari Kencang (Studio Rec)',
      artist: 'Highschool Heroes',
      type: 'Studio (Kompilasi JakCloth)',
      duration: '02:55',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    }
  ]
  const [activeTrack, setActiveTrack] = useState<Track>(tracks[0])

  const [stages, setStages] = useState<Stage[]>([
    { id: '1', name: 'Main Stage', currentBand: 'For Revenge', votes: 1420 },
    { id: '2', name: 'Indie Stage A', currentBand: 'The Overdue (Band Pembuka)', votes: 890 },
    { id: '3', name: 'Indie Stage B', currentBand: 'Rhythm Section', votes: 610 }
  ])
  const [hasVoted, setHasVoted] = useState<string | null>(null)

  const [merchList, setMerchList] = useState<Merchandise[]>([
    {
      id: 'm1',
      brand: 'ERIGO',
      title: 'Official JakCloth Edition Oversized Tee',
      price: 'Rp 185.000',
      discountPrice: 'Rp 99.000',
      stock: 150,
      claimed: 42,
      code: 'JKT-ERIGO-TSHIRT',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'm2',
      brand: 'ROUGHNECK 1991',
      title: 'JakCloth Special Edition Heavyweight Hoodie',
      price: 'Rp 350.000',
      discountPrice: 'Rp 199.000',
      stock: 100,
      claimed: 68,
      code: 'JKT-RN-HOODIE',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'm3',
      brand: 'SCREAMOUS',
      title: 'Limited Festival Trucker Cap',
      price: 'Rp 120.000',
      discountPrice: 'Rp 65.000',
      stock: 80,
      claimed: 51,
      code: 'JKT-SCR-CAP',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'm4',
      brand: 'SHINING BRIGHT',
      title: 'Festival Coach Jacket',
      price: 'Rp 399.000',
      discountPrice: 'Rp 249.000',
      stock: 50,
      claimed: 38,
      code: 'JKT-SB-JACKET',
      image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&auto=format&fit=crop&q=60'
    }
  ])
  const [activeQR, setActiveQR] = useState<{ code: string; title: string; brand: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [stagesRes] = await Promise.all([
        supabase.from('stages').select('*')
      ])
      if (stagesRes.data && stagesRes.data.length > 0) setStages(stagesRes.data)
    } catch (err) {
      console.log('Menggunakan data lokal:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVote(stageId: string) {
    if (hasVoted) return
    setHasVoted(stageId)
    const stage = stages.find((s) => s.id === stageId)
    const newVotes = (stage?.votes || 0) + 1
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, votes: newVotes } : s))
    )
    await supabase.from('stages').update({ votes: newVotes }).eq('id', stageId)
  }

  async function handleClaimMerch(item: Merchandise) {
    if (item.claimed >= item.stock) return
    const newClaimed = item.claimed + 1
    setMerchList((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, claimed: newClaimed } : m))
    )
    setActiveQR({ code: item.code, title: item.title, brand: item.brand })
    await supabase.from('vouchers').update({ claimed_count: newClaimed }).eq('id', item.id)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
          <span>Memuat Media & Katalog Merchandise...</span>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-16">
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-black text-white text-xl">J</div>
          <span className="font-bold text-lg tracking-wider text-white">
            JAKCLOTH <span className="text-red-500">MUSIC & MERCH</span>
          </span>
        </div>
        <span className="text-xs bg-red-950 text-red-400 border border-red-800/50 px-2.5 py-1 rounded-full font-mono">
          LIVE FESTIVAL APP
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-8">
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold text-red-500 uppercase tracking-widest">Featured Live Performance</span>
              <h2 className="text-xl font-bold">For Revenge — Jakarta Hari Ini</h2>
            </div>
            <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setMediaType('video')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${mediaType === 'video' ? 'bg-red-600 text-white' : 'text-neutral-400'}`}
              >
                Video Stream
              </button>
              <button
                onClick={() => setMediaType('audio')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${mediaType === 'audio' ? 'bg-red-600 text-white' : 'text-neutral-400'}`}
              >
                Audio Stream
              </button>
            </div>
          </div>

          <div className="bg-black flex items-center justify-center min-h-[260px]">
            {mediaType === 'video' ? (
              <video
                controls
                controlsList="nodownload"
                className="w-full aspect-video rounded-b-xl"
                poster="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60"
              >
                <source src={videoUrl} type="video/mp4" />
                Browser Anda tidak mendukung HTML5 video.
              </video>
            ) : (
              <div className="w-full p-8 flex flex-col items-center justify-center text-center bg-neutral-950">
                <span className="text-xs font-mono text-red-400 mb-2">High Quality Audio Stream</span>
                <p className="font-bold text-lg text-white mb-4">{activeTrack.title} — <span className="text-neutral-400">{activeTrack.artist}</span></p>
                <audio controls src={activeTrack.audioUrl} className="w-full max-w-md">
                  Browser Anda tidak mendukung HTML5 audio.
                </audio>
              </div>
            )}
          </div>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Katalog Album Kompilasi JakCloth</h3>
            <p className="text-xs text-neutral-400">Pilih lagu untuk langsung diputar di Audio Player di atas</p>
          </div>

          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => {
                  setActiveTrack(track)
                  setMediaType('audio')
                }}
                className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                  activeTrack.id === track.id ? 'bg-red-950/40 border-red-600/50' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{track.title}</p>
                  <p className="text-xs text-neutral-400">{track.artist}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">{track.type}</span>
                  <span className="text-xs text-neutral-500 font-mono">{track.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Merchandise & Voucher Booth Official</h3>
            <p className="text-xs text-neutral-400">Klaim voucher diskon eksklusif dan tukarkan QR Code langsung di booth brand</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {merchList.map((item) => {
              const isSoldOut = item.claimed >= item.stock
              return (
                <div key={item.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-md bg-neutral-900"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{item.brand}</span>
                    <h4 className="font-semibold text-white text-xs truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-emerald-400">{item.discountPrice}</span>
                      <span className="text-[10px] text-neutral-500 line-through">{item.price}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                      Stok: <span className="text-white font-bold">{item.stock - item.claimed}</span> / {item.stock}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClaimMerch(item)}
                    disabled={isSoldOut}
                    className={`px-3 py-2 rounded text-xs font-bold transition whitespace-nowrap ${
                      isSoldOut ? 'bg-neutral-800 text-neutral-500' : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isSoldOut ? 'Habis' : 'Klaim QR'}
                  </button>
                </div>
              )
            })}
          </div>

          {activeQR && (
            <div className="mt-6 p-4 bg-neutral-950 border border-red-900/50 rounded-xl flex flex-col items-center text-center">
              <span className="text-xs font-semibold text-emerald-400 mb-1">✓ Voucher Merchandise Berhasil Diklaim</span>
              <p className="text-xs text-neutral-400 font-mono mb-1">{activeQR.brand}</p>
              <p className="text-sm font-bold text-white mb-3">{activeQR.title}</p>
              
              <div className="p-3 bg-white rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(activeQR.code)}`}
                  alt="Voucher QR Code"
                  className="w-40 h-40"
                />
              </div>
              <p className="text-xs font-mono text-neutral-400 mt-3">Kode Verifikasi Kasir: <span className="text-white font-bold">{activeQR.code}</span></p>
              <button
                onClick={() => setActiveQR(null)}
                className="mt-3 text-xs text-neutral-500 hover:text-white underline"
              >
                Tutup QR Code
              </button>
            </div>
          )}
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Stage Crowd Voting</h3>
            <p className="text-xs text-neutral-400">Vote panggung terfavorit sekarang (1 device = 1 vote)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stages.map((stage) => (
              <div key={stage.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-mono">{stage.name}</span>
                  <h4 className="font-bold text-white text-base mt-1">{stage.currentBand}</h4>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-red-400">{stage.votes?.toLocaleString()} Votes</span>
                  <button
                    onClick={() => handleVote(stage.id)}
                    disabled={hasVoted !== null}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                      hasVoted === stage.id
                        ? 'bg-emerald-600 text-white'
                        : hasVoted !== null
                        ? 'bg-neutral-800 text-neutral-500'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {hasVoted === stage.id ? 'Voted' : 'Vote'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}