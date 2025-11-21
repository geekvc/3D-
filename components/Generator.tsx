import React, { useState, useCallback, useRef } from 'react';
import { AspectRatio } from '../types';
import { generateFigureImage } from '../services/geminiService';

// Dropdown Options
const SCALE_OPTIONS = [
  { label: '1/7 标准比例', value: '1/7 scale' },
  { label: '1/6 大比例', value: '1/6 scale' },
  { label: '1/4 巨型比例', value: '1/4 scale' },
  { label: 'Q版 / 粘土人', value: 'chibi nendoroid style' },
  { label: '1/12 可动人偶', value: '1/12 scale action figure' },
];

const STYLE_OPTIONS = [
  { label: '写实风格 (默认)', value: 'realistic style' },
  { label: '二次元动漫', value: 'anime style' },
  { label: '3D 渲染', value: '3D render style' },
  { label: 'GK 白模', value: 'unpainted grey resin garage kit' },
  { label: '赛博朋克', value: 'cyberpunk style' },
];

const BASE_OPTIONS = [
  { label: '圆形透明亚克力 (无字)', value: 'circular transparent acrylic base without any text' },
  { label: '实木底座', value: 'wooden base' },
  { label: '大理石底座', value: 'marble base' },
  { label: '发光 LED 底座', value: 'LED light-up base' },
  { label: '无底座', value: 'standing directly on desk' },
];

export const Generator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [scale, setScale] = useState(SCALE_OPTIONS[0].value);
  const [style, setStyle] = useState(STYLE_OPTIONS[0].value);
  const [base, setBase] = useState(BASE_OPTIONS[0].value);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Landscape);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setError(null); // Clear error if they upload an image
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      setError("请先上传一张参考图片，才能生成对应的手办。");
      return;
    }
    
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Construct the complex prompt based on user selections and the fixed scene requirement
      const fullPrompt = `Create a ${scale} model figure based on the attached reference image. ` + 
        `Style: ${style}. Base: ${base}. ` +
        `Environment: Place the figure on a computer desk. On the computer screen behind it, display the ZBrush modeling process of this figure. ` +
        `Next to the computer screen, place a TAMIYA-style toy packaging box printed with the original artwork. ` +
        (prompt ? `Additional details: ${prompt}` : "");

      const imageBase64 = await generateFigureImage(fullPrompt, aspectRatio, uploadedImage);
      setGeneratedImage(imageBase64);
    } catch (err: any) {
      setError(err.message || "发生意外错误，请重试。");
    } finally {
      setLoading(false);
    }
  }, [prompt, scale, style, base, aspectRatio, uploadedImage]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `nano-figure-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
            定制参数
          </h2>
          
          <div className="space-y-5">
            {/* Image Upload Section (Mandatory) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                参考图片 <span className="text-red-500">*</span>
              </label>
              
              {!uploadedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                    error && !uploadedImage 
                      ? 'border-red-500/50 bg-red-500/5' 
                      : 'border-gray-700 hover:border-yellow-500/50 hover:bg-gray-800/30'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500 group-hover:text-yellow-500 mb-2 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300">点击上传参考图 (必须)</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-700 group">
                  <img src={uploadedImage} alt="Reference" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <button 
                    onClick={removeUploadedImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white p-1.5 rounded-full backdrop-blur-md transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-xs text-white/90 font-medium px-1">已加载参考图</span>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">手办比例</label>
                <select 
                  value={scale} 
                  onChange={(e) => setScale(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 outline-none focus:border-yellow-500 transition-colors"
                >
                  {SCALE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">生成风格</label>
                <select 
                  value={style} 
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 outline-none focus:border-yellow-500 transition-colors"
                >
                   {STYLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">底座材质</label>
                <select 
                  value={base} 
                  onChange={(e) => setBase(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 outline-none focus:border-yellow-500 transition-colors"
                >
                   {BASE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">
                补充细节 (可选)
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all resize-none"
                placeholder="例如：粉色头发，拿着一把剑..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                图片尺寸
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(AspectRatio).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setAspectRatio(value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      aspectRatio === value
                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {key === 'Square' ? '方形 (1:1)' : 
                     key === 'Portrait' ? '竖向 (3:4)' :
                     key === 'Landscape' ? '横向 (4:3)' :
                     key === 'Wide' ? '宽屏 (16:9)' : '长屏 (9:16)'} 
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20 hover:shadow-yellow-500/40 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在雕刻...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" />
                    <path d="M3.265 10.602l7.668 4.129a2.25 2.25 0 002.134 0l7.668-4.13 1.37.739a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.71 0l-9.75-5.25a.75.75 0 010-1.32l1.37-.738z" />
                    <path d="M10.933 19.231l-7.668-4.13-1.37.739a.75.75 0 000 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 000-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 01-2.134 0z" />
                  </svg>
                  生成 3D 手办
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Tips / Info */}
        <div className="bg-gray-900/30 border border-gray-800/50 p-4 rounded-xl text-xs text-gray-500">
           <p className="font-semibold text-gray-400 mb-1">使用说明</p>
           <p>上传您的人物图片，AI 将自动为您生成置于电脑桌场景中的精美手办模型图。场景包含 ZBrush 建模屏幕和 TAMIYA 风格包装盒。</p>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-8">
        <div className="h-full min-h-[600px] bg-gray-900/50 border border-gray-800 rounded-2xl p-1 flex flex-col relative overflow-hidden group shadow-2xl">
          {/* Background grid pattern for the 'editor' feel */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>

          <div className="flex-grow relative flex items-center justify-center p-6">
            {!generatedImage && !loading && !error && (
              <div className="text-center max-w-sm mx-auto opacity-50">
                <div className="w-20 h-20 bg-gray-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-300 mb-2">等待指令</h3>
                <p className="text-gray-500 text-sm">请在左侧上传参考图并配置手办参数，然后点击生成。</p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="inline-block relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="mt-4 text-yellow-500 font-mono text-sm animate-pulse">AI 正在进行 ZBrush 建模与渲染...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center max-w-md mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 mx-auto mb-3 opacity-80">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-bold mb-1">生成中断</h3>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {generatedImage && !loading && (
              <img 
                src={generatedImage} 
                alt="Generated Figure" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
              />
            )}
          </div>

          {/* Actions Bar */}
          {generatedImage && !loading && (
             <div className="absolute bottom-6 right-6 flex gap-3">
                <button 
                  onClick={handleDownload}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-3 rounded-full transition-all shadow-lg hover:shadow-white/10 group"
                  title="下载高清大图"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};