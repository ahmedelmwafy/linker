"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Clipboard, 
  Image as ImageIcon, 
  Smartphone, 
  Laptop, 
  Copy, 
  Check, 
  Upload, 
  ExternalLink,
  History,
  Wifi
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [copied, setCopied] = useState(false);
  const [localIp, setLocalIp] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Set isClient to true and fetch local IP when component mounts
  useEffect(() => {
    setIsClient(true);
    
    // Auto-detect local IP from server
    const fetchIp = async () => {
      try {
        const res = await fetch("/api/ip");
        const data = await res.json();
        if (data.ip && data.ip !== 'localhost') {
          setLocalIp(data.ip);
        }
      } catch (error) {
        console.error("Failed to fetch local IP:", error);
      }
    };

    fetchIp();
  }, []);

  const fetchClipboard = useCallback(async () => {
    try {
      const res = await fetch("/api/clipboard");
      const data = await res.json();
      setText(data.text || "");
      setFiles(data.files || []);
      setLastUpdated(data.lastUpdated);
    } catch (error) {
      console.error("Failed to fetch clipboard:", error);
    }
  }, []);

  useEffect(() => {
    fetchClipboard();
    const interval = setInterval(fetchClipboard, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchClipboard]);

  const updateText = async (newText: string) => {
    setText(newText);
    try {
      await fetch("/api/clipboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      });
    } catch (error) {
      console.error("Failed to update text:", error);
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("/api/clipboard", {
        method: "POST",
        body: formData,
      });
      fetchClipboard();
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isClient) return null;

  const connectionUrl = localIp ? `http://${localIp}:3000` : "";

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Clipboard className="text-white relative z-10" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text">Linker</h1>
            <p className="text-sm text-gray-400 font-medium">Professional Cross-Device Sync</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-medium">Connected</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Text & Links */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-card">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clipboard size={20} />
                <h2 className="font-semibold text-lg">Shared Clipboard</h2>
              </div>
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Copy to clipboard"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => updateText(e.target.value)}
              placeholder="Paste text or links here..."
              className="w-full h-48 bg-black/20 border border-white/10 rounded-xl p-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none text-lg"
            />
            
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <History size={14} />
                <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}</span>
              </div>
              {text.startsWith('http') && (
                <a 
                  href={text} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-400 hover:underline"
                >
                  <ExternalLink size={14} />
                  Open Link
                </a>
              )}
            </div>
          </section>

          <section className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-purple-400">
                <ImageIcon size={20} />
                <h2 className="font-semibold text-lg">Shared Media</h2>
              </div>
              <label className={`btn-primary text-sm py-2 px-4 cursor-pointer ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : 'Share Media'}
                <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
              </label>
            </div>

            <div className="space-y-6">
              {/* Images Grid */}
              {files.filter(f => f.type === 'image').length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {files.filter(f => f.type === 'image').map((file, i) => (
                      <motion.div 
                        key={file.url}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="aspect-square rounded-xl overflow-hidden border border-white/10 relative group"
                      >
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a 
                            href={file.url} 
                            download={file.name}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                          >
                            <Upload size={18} className="rotate-180 text-white" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Other Files List */}
              {files.filter(f => f.type === 'file').length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Other Files</h3>
                  <div className="space-y-2">
                    {files.filter(f => f.type === 'file').map((file) => (
                      <div key={file.url} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                            <Upload size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                            <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB • {new Date(file.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <a 
                          href={file.url} 
                          download={file.name}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <Upload size={18} className="rotate-180" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {files.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                  <ImageIcon size={48} className="mb-2 opacity-20" />
                  <p>No media shared yet</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Connection & Info */}
        <div className="space-y-6">
          <section className="glass-card">
            <div className="flex items-center gap-2 text-pink-400 mb-6">
              <Smartphone size={20} />
              <h2 className="font-semibold text-lg">Connect iPhone</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm">
                <p className="text-gray-400 mb-4">
                  1. Connect both devices to the same Wi-Fi.
                </p>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 flex items-center gap-1">
                    <Wifi size={12} />
                    Your PC IP Address
                  </label>
                  <input 
                    type="text" 
                    value={localIp}
                    onChange={(e) => setLocalIp(e.target.value)}
                    placeholder="e.g. 192.168.1.10"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-pink-500/50"
                  />
                  <p className="text-[10px] text-gray-600">
                    Run <code className="bg-white/5 px-1 rounded">hostname -I</code> or <code className="bg-white/5 px-1 rounded">ipconfig</code> to find your IP.
                  </p>
                </div>
              </div>

              {localIp ? (
                <div className="flex flex-col items-center p-6 bg-white rounded-2xl">
                  <QRCodeSVG value={connectionUrl} size={180} />
                  <p className="mt-4 text-xs text-black font-medium text-center">
                    Scan with iPhone camera to open:<br/>
                    <span className="text-indigo-600">{connectionUrl}</span>
                  </p>
                </div>
              ) : (
                <div className="aspect-square bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600 p-6 text-center">
                  <Smartphone size={40} className="mb-2 opacity-20" />
                  <p className="text-sm">Enter your PC's IP address above to generate a QR code</p>
                </div>
              )}
            </div>
          </section>

          <section className="glass-card bg-indigo-600/10 border-indigo-600/20">
            <h3 className="font-semibold text-indigo-300 mb-2">Pro Tip</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Open this page on your iPhone. Anything you type or upload there will appear here instantly, and vice-versa. Perfect for sharing links and photos between devices!
            </p>
          </section>
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-600 text-sm py-8 border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} Linker. Made for seamless sharing.</p>
      </footer>
    </main>
  );
}
