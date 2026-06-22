import { useEffect, useRef, useState } from 'react';

const QRScanner = ({ onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const jsQRRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // Check if jsQR already loaded
    if (window.jsQR) {
      jsQRRef.current = window.jsQR;
      startCamera();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    scriptRef.current = script;
    script.onload = () => {
      jsQRRef.current = window.jsQR;
      startCamera();
    };
    script.onerror = () => setError('Failed to load QR scanner library. Please check your internet connection.');
    document.head.appendChild(script);

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      // Wait for videoRef to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setScanning(true);
            scan();
          };
        }
      }, 100);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access from browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found.');
      } else {
        setError('Cannot start camera: ' + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scan = () => {
    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (jsQRRef.current) {
        const code = jsQRRef.current(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code) {
          setResult(code.data);
          stopCamera();
          return;
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const reset = () => {
    setResult(null);
    setError('');
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📷</span>
            <div>
              <h2 className="text-white font-bold text-lg">QR Scanner</h2>
              <p className="text-purple-200 text-xs">Scan QR code with camera</p>
            </div>
          </div>
          <button onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold text-lg transition">
            ✕
          </button>
        </div>

        <div className="p-5">
          {/* Camera view */}
          {!result && !error && (
            <div className="relative rounded-2xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {/* Scanning frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-52 h-52">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-purple-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-purple-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-purple-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-purple-400 rounded-br-lg" />
                  {/* Animated scan line */}
                  {scanning && (
                    <div className="absolute left-2 right-2 h-0.5 bg-purple-400"
                      style={{ animation: 'scanLine 2s ease-in-out infinite', top: '50%' }} />
                  )}
                </div>
              </div>
              {/* Status badge */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${scanning ? 'bg-purple-600/80 text-white' : 'bg-gray-800/80 text-gray-300'}`}>
                  {scanning ? (
                    <><div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" />Scanning…</>
                  ) : (
                    <><div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />Camera starting…</>
                  )}
                </div>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Success result */}
          {result && (
            <div className="mb-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="font-bold text-green-800">QR Code Detected!</p>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-xl p-3 border border-green-100 dark:border-gray-600 mb-3">
                  <p className="text-xs text-gray-400 mb-1 uppercase font-bold">Scanned Content</p>
                  <p className="text-sm text-gray-800 break-all font-mono leading-relaxed">{result}</p>
                </div>
                {/* UPI detection */}
                {result.startsWith('upi://') && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold mb-1">💳 UPI Payment Detected</p>
                    <p className="text-xs text-blue-500">ID: {result.match(/pa=([^&]+)/)?.[1] || '—'}</p>
                    <p className="text-xs text-blue-500">Name: {decodeURIComponent(result.match(/pn=([^&]+)/)?.[1] || '—')}</p>
                  </div>
                )}
                {/* Link detection */}
                {(result.startsWith('http://') || result.startsWith('https://')) && (
                  <a href={result} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-2 text-sm text-blue-500 hover:text-blue-600 font-semibold">
                    🔗 Open Link →
                  </a>
                )}
              </div>
              <button onClick={reset}
                className="w-full py-3 rounded-xl font-bold text-white hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
                📷 Scan Another QR Code
              </button>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mb-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-3">
                <p className="text-red-700 text-sm font-medium">❌ {error}</p>
              </div>
              <button onClick={reset}
                className="w-full py-3 rounded-xl font-bold text-white hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
                🔄 Try Again
              </button>
            </div>
          )}

          {/* Static UPI QR display */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 text-center mb-3 font-bold uppercase tracking-wider">Steps & Carry Payment QR</p>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 border border-gray-100 dark:border-gray-600">
              <div className="bg-white dark:bg-gray-600 p-2 rounded-xl border border-gray-100 dark:border-gray-500 flex-shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent("upi://pay?pa=patrashreya477@okhdfcbank&pn=Steps and Carry&cu=INR")}`}
                  alt="UPI QR"
                  className="w-20 h-20"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Steps & Carry</p>
                <p className="text-sm font-black text-gray-800">patrashreya477</p>
                <p className="text-xs text-gray-500">@okhdfcbank</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-xs text-green-600 font-semibold">Ready to receive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(-100px); opacity: 1; }
          50% { opacity: 0.6; }
          100% { transform: translateY(100px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
