import React, { useRef, useEffect, useState } from 'react';
import { FileText, ArrowRight, Sparkle } from 'lucide-react';

/**
 * HeroVisual Component
 * A standalone Three.js animation featuring:
 * 1. A dynamic particle field (3000 points).
 * 2. A reactive wireframe plane that follows mouse movement.
 * 3. Dynamic vertex manipulation for a subtle "wave" effect.
 * 4. CDN-based library loading to avoid build-time resolution errors.
 */
const HeroVisual = () => {
  const mountRef = useRef(null);

  // Helper to load Three.js from CDN
  const loadThree = () => {
    return new Promise((resolve, reject) => {
      if (window.THREE) return resolve(window.THREE);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.onload = () => resolve(window.THREE);
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let cancelled = false;
    let renderer = null;
    let scene = null;
    let camera = null;
    let points = null;
    let reactOrbital = null;
    let animationFrameId = null;
    let onMouseMove = null;
    let handleResize = null;
    let cleanupFromInit = () => {};

    const init = async () => {
      const THREE = await loadThree();
      if (!THREE || !mountRef.current || cancelled) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      // 1. Scene Setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      if (cancelled) return;
      mountRef.current.appendChild(renderer.domElement);

      // 2. Particle Field
      const particlesGeo = new THREE.BufferGeometry();
      const count = 3000;
      const posArr = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        posArr[i] = (Math.random() - 0.5) * 15;
      }
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      const particlesMat = new THREE.PointsMaterial({
        size: 0.015,
        color: 0x6366f1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      points = new THREE.Points(particlesGeo, particlesMat);
      scene.add(points);

      // 3. React-logo style orbitals
      reactOrbital = new THREE.Group();

      const ringGeoOuter = new THREE.TorusGeometry(2.2, 0.07, 32, 128);
      const ringGeoInner = new THREE.TorusGeometry(1.6, 0.05, 32, 96);

      const ringMatBright = new THREE.MeshPhongMaterial({
        color: 0x60a5fa,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.7,
        shininess: 90,
        transparent: true,
        opacity: 0.95,
      });

      const ringMatSoft = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.4,
        shininess: 60,
        transparent: true,
        opacity: 0.6,
      });

      // Outer bright orbitals (classic React look) – oriented to face camera vertically
      const ring1 = new THREE.Mesh(ringGeoOuter, ringMatBright);
      ring1.rotation.set(0, 0, 0);

      const ring2 = ring1.clone();
      ring2.rotation.set(0, 0, Math.PI / 3);

      const ring3 = ring1.clone();
      ring3.rotation.set(0, 0, -Math.PI / 3);

      // Inner softer orbitals for depth
      const inner1 = new THREE.Mesh(ringGeoInner, ringMatSoft);
      inner1.rotation.set(0, 0, 0);

      const inner2 = inner1.clone();
      inner2.rotation.set(0, 0, Math.PI / 3);

      const inner3 = inner1.clone();
      inner3.rotation.set(0, 0, -Math.PI / 3);

      reactOrbital.add(ring1);
      reactOrbital.add(ring2);
      reactOrbital.add(ring3);
      reactOrbital.add(inner1);
      reactOrbital.add(inner2);
      reactOrbital.add(inner3);

      // central "nucleus"
      const coreGeo = new THREE.SphereGeometry(0.3, 32, 32);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.9,
        roughness: 0.3,
        metalness: 0.4,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      reactOrbital.add(core);

      scene.add(reactOrbital);

      // 4. Lighting
      const mainLight = new THREE.PointLight(0x6366f1, 1.5, 100);
      mainLight.position.set(5, 5, 5);
      scene.add(mainLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientLight);

      camera.position.z = 6;

      // 5. Interaction State
      let mouseX = 0,
        mouseY = 0;
      onMouseMove = (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener('mousemove', onMouseMove);

      // 6. Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (cancelled) return;
        const time = Date.now() * 0.001;

        // Rotate background particles
        points.rotation.y += 0.0005;
        points.rotation.x += 0.0002;

        // Animate React-logo style orbitals
        if (reactOrbital) {
          // Gentle float
          reactOrbital.position.y = Math.sin(time * 0.8) * 0.25;

          // Rotate the whole group in all directions with cursor influence
          const baseRotX = 0; // facing viewer vertically
          const baseRotY = 0;

          const targetRotY = baseRotY + mouseX * 1.0; // left/right movement
          const targetRotX = baseRotX + mouseY * 1.0; // up/down movement

          reactOrbital.rotation.y = THREE.MathUtils.lerp(reactOrbital.rotation.y, targetRotY, 0.08);
          reactOrbital.rotation.x = THREE.MathUtils.lerp(reactOrbital.rotation.x, targetRotX, 0.08);

          // Subtle continuous spin around Z for extra depth
          reactOrbital.rotation.z += 0.01;

          // Each ring also spins in place for extra motion
          reactOrbital.children.forEach((child) => {
            if (child.isMesh) {
              child.rotation.z += 0.02;
            }
          });
        }

        renderer.render(scene, camera);
      };
      animate();

      // 7. Responsive Resizing
      handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Return cleanup so React can run it on unmount (listeners, animation, DOM, WebGL)
      return () => {
        if (onMouseMove) window.removeEventListener('mousemove', onMouseMove);
        if (handleResize) window.removeEventListener('resize', handleResize);
        if (animationFrameId != null) cancelAnimationFrame(animationFrameId);
        if (mountRef.current && renderer?.domElement?.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        if (renderer) {
          renderer.dispose();
        }
      };
    };

    init().then((cleanupFn) => {
      if (typeof cleanupFn === 'function') cleanupFromInit = cleanupFn;
    });

    return () => {
      cancelled = true;
      cleanupFromInit();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ minHeight: '600px', display: 'block' }}
    />
  );
};

// --- LANDING PAGE ---
const LandingPage = ({ onStart }) => {
  // Simple in-place chat bot for AI Writer section
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm your resume AI helper. Tell me about your role, experience and what kind of job you want, and I'll suggest a summary line you can copy into your resume.",
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const buildBotReply = (userMessage) => {
    const base =
      "Here's a sample resume summary you can use or edit:\n\n";
    const suggestion =
      "Results-driven professional with relevant experience, combining strong technical skills with problem-solving and communication abilities to deliver high-quality work.";

    return (
      base +
      `“${userMessage.trim() || 'Motivated candidate seeking opportunities to grow and contribute to a forward-thinking organization.'}”\n\n` +
      suggestion
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { from: 'user', text: userText },
      { from: 'bot', text: buildBotReply(userText) },
    ]);
    setChatInput('');
  };

  return (
  <div className="bg-[#020617] min-h-screen text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
    {/* Navbar */}
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-2xl bg-slate-900/80 border border-indigo-500/60 shadow-[0_0_24px_rgba(79,70,229,0.65)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-[1px] rounded-[14px] bg-gradient-to-br from-indigo-500 via-sky-400 to-violet-500 opacity-80" />
          <div className="relative flex items-center justify-center w-full h-full rounded-[14px] bg-slate-950/80">
            <span className="text-[14px] font-black tracking-tight text-white">
              R<span className="text-sky-300">Ø</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-sm text-slate-300 uppercase tracking-[0.35em]">NEURAL</span>
          <span className="font-black text-lg tracking-tight">
            <span className="text-white">Resu</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-sky-400">mate</span>
          </span>
        </div>
      </div>
      <div className="hidden md:flex gap-10 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        <a href="#features" className="hover:text-white transition-colors">Templates</a>
        <a href="#ai" className="hover:text-white transition-colors">AI Writer</a>
        <a href="#" className="hover:text-white transition-colors">Pricing</a>
      </div>
      <button onClick={onStart} className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-slate-200 transition-all">
        Register
      </button>
    </nav>

    {/* Hero Section */}
    <section className="relative pt-40 md:pt-52 pb-20 px-6 md:px-12 max-w-7xl mx-auto text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute inset-0 bg-indigo-600/10 blur-[180px] rounded-full" />
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">THE #1 RESUME BUILDER</p>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-4xl mx-auto">
          Resume That Will Get You The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-600">Dream Job</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          With our professional templates, create resumes tailored to your strengths and aspirations. Powered by the latest AI writing models.
        </p>
        
        <div className="flex flex-col items-center gap-6 pt-4">
          <button 
            onClick={onStart}
            className="group px-10 py-5 bg-indigo-600 rounded-full font-black text-sm shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            Create now
          </button>
        </div>
      </div>

      {/* Hero Visual Mockup */}
      <div className="mt-20 relative w-full max-w-5xl mx-auto aspect-video rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.15)] group">
        <HeroVisual />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-2/3 h-2/3 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl group-hover:scale-105 transition-transform duration-700">
              <div className="flex gap-4 items-center border-b border-white/5 pb-4 mb-4">
                 <div className="w-12 h-12 rounded-full bg-slate-800" />
                 <div className="space-y-2">
                    <div className="h-3 w-32 bg-white/20 rounded" />
                    <div className="h-2 w-20 bg-white/10 rounded" />
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="h-2 w-full bg-white/5 rounded" />
                 <div className="h-2 w-full bg-white/5 rounded" />
                 <div className="h-2 w-3/4 bg-white/5 rounded" />
              </div>
           </div>
        </div>
      </div>
    </section>

    {/* Feature Blocks */}
    <section id="features" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { step: '1.', title: 'Pick a template', desc: 'Choose a template that suits your profile the best.', color: 'bg-blue-500', text: 'text-white' },
          { step: '2.', title: 'Fill in your details', desc: 'Quickly provide and customize your professional history.', color: 'bg-white', text: 'text-black' },
          { step: '3.', title: 'Save, download, and share', desc: 'Once done, export high-res PDF and land your next role.', color: 'bg-white', text: 'text-black' }
        ].map((f, i) => (
          <div key={i} className={`${f.color} ${f.text} p-12 rounded-[48px] shadow-2xl flex flex-col justify-between aspect-square md:aspect-[4/5] hover:-translate-y-4 transition-all duration-500`}>
            <span className="text-4xl font-black">{f.step}</span>
            <div>
              <h3 className="text-4xl font-black tracking-tighter mb-4">{f.title}</h3>
              <p className="opacity-60 text-sm font-medium leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* AI Writing Highlight */}
    <section id="ai" className="py-32 px-6 md:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
      <div className="space-y-8">
        <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">ChatGPT AI WRITING</p>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">AI-Powered Resume Assistance for Higher Scores</h2>
        <p className="text-slate-400 text-lg">We integrate cutting-edge AI technology in our resume-building process, leaving traditional methods behind. Our tools analyze your input and provide personalized suggestions to enhance content.</p>
        <button onClick={onStart} className="flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">Get started now <ArrowRight size={18} /></button>
      </div>
      <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[40px] shadow-2xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl -z-10" />
        <div className="flex items-center gap-2 mb-10 text-indigo-400">
           <Sparkle size={18} />
           <span className="text-xs font-bold uppercase tracking-widest">Writing by Gemini AI</span>
        </div>
        <div className="p-6 bg-white/5 rounded-2xl mb-8">
           <p className="text-sm text-slate-300 italic">"By beginning your resume summary with your professional title, you inform recruiters that your resume is relevant to their needs..."</p>
        </div>
        <div className="flex items-center justify-center p-6 md:p-8 border-2 border-dashed border-white/10 rounded-3xl">
          {!showChatBot ? (
            <button
              className="px-8 py-3 bg-indigo-600 rounded-xl font-bold"
              onClick={() => setShowChatBot(true)}
            >
              Do it for me
            </button>
          ) : (
            <div className="w-full max-w-md">
              <div className="text-sm text-slate-300 mb-3 font-semibold">
                Simple AI chat helper (no login or API key needed)
              </div>
              <div className="h-52 md:h-64 bg-slate-900/60 rounded-2xl p-3 overflow-y-auto text-xs space-y-2 border border-white/5">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.from === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-xl max-w-[85%] whitespace-pre-wrap ${
                        msg.from === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Describe your experience and target role..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold hover:bg-indigo-500 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  </div>
);
};

export { HeroVisual, LandingPage };
