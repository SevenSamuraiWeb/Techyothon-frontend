'use client'
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { JSX } from 'react/jsx-runtime';

// Allow a script-injected global THREE to exist on window
declare global {
    interface Window {
        THREE: any;
    }
}

// --- NEW Three.js Component ---
// This component will load Three.js and render our particle animation

const ThreeJSAnimation = () => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<any>(null);

    useEffect(() => {
        let script = document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"]');
        let isScriptLoaded = !!script;
        let animationFrameId: number;
        let renderer: { setPixelRatio: (arg0: number) => void; setSize: (arg0: any, arg1: any) => void; setClearColor: (arg0: number, arg1: number) => void; domElement: any; render: (arg0: any, arg1: any) => void; dispose: () => void; };
        let scene: { add: (arg0: any) => void; position: any; } | null, camera: { position: { z: number; x: number; y: number; }; aspect: number; updateProjectionMatrix: () => void; lookAt: (arg0: any) => void; }, particleSystem: { rotation: { x: number; y: number; }; };
        let mouseX = 0, mouseY = 0;
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;

        const currentMount = mountRef.current!;
        if (!currentMount) return;

        const initThree = () => {
            try {
                // --- Scene Setup ---
                scene = new window.THREE.Scene();
                sceneRef.current = scene; // Save scene to ref for cleanup

                camera = new window.THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 1, 1000);
                camera.position.z = 10;

                renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
                renderer.setClearColor(0x000000, 0); // Transparent background
                currentMount.appendChild(renderer.domElement);

                // --- Particle System ---
                const particlesGeometry = new window.THREE.BufferGeometry();
                const count = 7000;
                const positions = new Float32Array(count * 3);
                const colors = new Float32Array(count * 3);

                const color = new window.THREE.Color();
                const radius = 4;

                for (let i = 0; i < positions.length; i += 3) {
                    // Spherical coordinates
                    const u = Math.random();
                    const v = Math.random();

                    const theta = 2 * Math.PI * u;
                    const phi = Math.acos(2 * v - 1);

                    const x = radius * Math.sin(phi) * Math.cos(theta);
                    const y = radius * Math.sin(phi) * Math.sin(theta);
                    const z = radius * Math.cos(phi);

                    positions[i] = x;
                    positions[i + 1] = y;
                    positions[i + 2] = z;

                    // Color
                    // Mix of indigo and a lighter blue/white
                    if (Math.random() > 0.5) {
                        color.set(0x4f46e5); // Indigo
                    } else {
                        color.set(0xa5b4fc); // Light Indigo
                    }

                    colors[i] = color.r;
                    colors[i + 1] = color.g;
                    colors[i + 2] = color.b;
                }

                particlesGeometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3));
                particlesGeometry.setAttribute('color', new window.THREE.BufferAttribute(colors, 3));

                const particlesMaterial = new window.THREE.PointsMaterial({
                    size: 0.035,
                    vertexColors: true,
                    blending: window.THREE.AdditiveBlending,
                    transparent: true,
                    depthWrite: false,
                });

                particleSystem = new window.THREE.Points(particlesGeometry, particlesMaterial);
                scene!.add(particleSystem);

                // --- Event Listeners ---
                const onResize = () => {
                    if (!renderer || !currentMount) return;
                    windowHalfX = currentMount.clientWidth / 2;
                    windowHalfY = currentMount.clientHeight / 2;

                    camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
                };

                const onMouseMove = (event: { clientX: number; clientY: number; }) => {
                    if (!currentMount) return;
                    // Calculate mouse position relative to the element
                    const rect = currentMount.getBoundingClientRect();
                    mouseX = (event.clientX - rect.left - (rect.width / 2)) * 0.002;
                    mouseY = (event.clientY - rect.top - (rect.height / 2)) * 0.002;
                };

                window.addEventListener('resize', onResize);
                currentMount.addEventListener('mousemove', onMouseMove);

                // --- Animation Loop ---
                const animate = () => {
                    animationFrameId = requestAnimationFrame(animate);

                    const time = Date.now() * 0.0001;

                    // Gently rotate the whole system
                    particleSystem.rotation.x = time * 0.2;
                    particleSystem.rotation.y = time * 0.15;

                    // Add mouse interactivity
                    // Use a dampening effect for smoother movement
                    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
                    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
                    camera.lookAt(scene!.position);

                    renderer.render(scene, camera);
                };

                animate();

            } catch (error) {
                console.error("Three.js initialization error:", error);
                // Fallback text if WebGL fails
                if (currentMount) {
                    currentMount.innerHTML = '<p class="text-indigo-800/60">3D animation could not be loaded.</p>';
                }
            }
        };

        // --- Script Loading Logic ---
        if (isScriptLoaded) {
            if (window.THREE) {
                initThree();
            } else {
                script.addEventListener('load', initThree);
            }
        } else {
            script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
            script.async = true;
            document.body.appendChild(script);
            script.addEventListener('load', initThree);
        }

        // --- Cleanup Function ---
        return () => {
            cancelAnimationFrame(animationFrameId);

            // Store locally to avoid null ref issues on unmount
            const mountElement = currentMount;

            // Remove listeners
            window.removeEventListener('resize', onresize);
            if (mountElement) {
                mountElement.removeEventListener('mousemove', onmousemove);
            }

            // Dispose of Three.js objects
            if (sceneRef.current) {
                sceneRef.current.traverse((object: { geometry: { dispose: () => void; }; material: { forEach: (arg0: (material: any) => any) => void; dispose: () => void; }; }) => {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material: { dispose: () => any; }) => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }

            if (renderer) {
                renderer.dispose();
            }

            // Remove canvas from DOM
            if (mountElement && renderer && renderer.domElement) {
                if (mountElement.contains(renderer.domElement)) {
                    mountElement.removeChild(renderer.domElement);
                }
            }

            // Remove script if we added it
            if (script && !isScriptLoaded && document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };

    }, []); // Empty dependency array ensures this runs once on mount

    return (
        <div
            ref={mountRef}
            className="w-full h-full"
            style={{ cursor: 'move' }}
        >
            {/* Fallback loading text */}
            <div className="w-full h-full flex items-center justify-center animate-pulse text-indigo-800/60">
                Loading 3D Animation...
            </div>
        </div>
    );
};


// Icon imports (using lucide-react, common in Next.js projects)
// In a real Next.js app, you'd install this with `npm install lucide-react`
// For this single-file example, we'll use inline SVGs as components.

const Menu = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);

const X = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

const Camera = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

// NEW ICON
const Smartphone = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
    </svg>
);

// NEW ICON
const Route = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="6" cy="19" r="3" />
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
        <circle cx="18" cy="5" r="3" />
    </svg>
);

// NEW ICON
const Quote = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2S6 3.75 6 5v6H3c-1 0-1 1-1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2s-2 1.25-2 3v6h-3c-1 0-1 1-1 1z" />
    </svg>
);

const MapPin = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const BarChart3 = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M3 3v18h18" />
        <path d="M7 12v4" />
        <path d="M12 8v8" />
        <path d="M17 4v12" />
    </svg>
);

const CheckCircle2 = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const TrendingUp = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
    </svg>
);

const Users = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);


// Main Landing Page Component
export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // We'll add a <style> tag to define our animations (similar to GSAP effects)
    const animations = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes backgroundPulse {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    /* NEW Animation */
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 1s ease-out forwards;
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.8s ease-out forwards;
      opacity: 0;
    }
    
    /* NEW Animation Class */
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    /* Staggered animation delays */
    .stagger-1 { animation-delay: 0.2s; }
    .stagger-2 { animation-delay: 0.4s; }
    .stagger-3 { animation-delay: 0.6s; }
    .stagger-4 { animation-delay: 0.8s; }
  `;

    const navLinks = [
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Features', href: '#features' },
        { name: 'Dashboard', href: '#dashboard' },
        { name: 'Community', href: '#community' },
    ];

    const features = [
        {
            icon: <Camera className="w-8 h-8 text-indigo-600" />,
            title: 'Simple Reporting',
            description: 'Easily submit issues with photos, voice notes, or precise location data.',
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
            title: 'Real-Time Tracking',
            description: 'Track the status of your report from "Submitted" to "Resolved". No more guessing.',
        },
        {
            icon: <Users className="w-8 h-8 text-indigo-600" />,
            title: 'Community Verification',
            description: 'Confirm that issues are truly fixed, providing valuable feedback to authorities.',
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
            title: 'AI Prioritization',
            description: 'Our system automatically groups duplicate reports and flags urgent issues.',
        },
    ];

    return (
        <>
            {/* This style tag injects our custom animations. 
        In Next.js, you might use styled-jsx or a global CSS file.
      */}
            <style>{animations}</style>

            <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
                {/* Header */}
                <header className="absolute top-0 left-0 w-full z-10 py-5 px-4 sm:px-8 animate-fadeIn">
                    {/* ... existing header code ... */}
                    <div className="container mx-auto max-w-7xl flex justify-between items-center">
                        <a href="#" className="text-2xl font-bold text-indigo-700">
                            CivicTrack
                        </a>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>

                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/login" className="text-slate-600 hover:text-indigo-600 transition-colors">
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
                            >
                                Sign Up
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 bg-white z-20 pt-20 px-8 flex flex-col space-y-6 animate-fadeIn">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-2xl text-slate-700 hover:text-indigo-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <a
                            href="#"
                            className="text-2xl text-slate-700 hover:text-indigo-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Log In
                        </a>
                        <a
                            href="#"
                            className="mt-4 w-full text-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
                        >
                            Sign Up
                        </a>
                    </div>
                )}

                {/* Hero Section */}
                <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            {/* Hero Text Content */}
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight animate-fadeInUp">
                                    Fix your city.
                                    <br />
                                    <span className="text-indigo-600">Faster. Together.</span>
                                </h1>
                                {/* --- EDITED CONTENT --- */}
                                <p className="mt-6 text-lg text-slate-600 max-w-md mx-auto md:mx-0 animate-fadeInUp stagger-1">
                                    Report local problems like potholes, broken lights, and
                                    overflowing bins in seconds. Track their resolution in
                                    real-time and join your neighbors in building a better, more accountable community.
                                </p>
                                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fadeInUp stagger-2">
                                    <a
                                        href="#"
                                        className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Report an Issue
                                    </a>
                                    <a
                                        href="#how-it-works"
                                        className="bg-white text-slate-700 px-8 py-4 rounded-lg font-medium text-lg shadow-lg shadow-slate-300/30 border border-slate-200 hover:bg-slate-100 transition-all"
                                    >
                                        How It Works
                                    </a>
                                </div>
                            </div>

                            {/* --- REPLACED SPLINE WITH THREE.JS --- */}
                            <div className="w-full h-80 sm:h-96 lg:h-[500px] animate-fadeIn stagger-2 animate-float">
                                <div className="w-full h-full rounded-2xl shadow-2xl shadow-indigo-200/50 overflow-hidden border-4 border-white/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                                    <ThreeJSAnimation />
                                </div>
                            </div>

                        </div>
                    </div>
                </main>

                {/* --- "How It Works" Section --- */}
                <section id="how-it-works" className="py-20 sm:py-32 bg-white">
                    <div className="container mx-auto max-w-6xl px-4 sm:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wide animate-fadeInUp">
                                Get Started in Minutes
                            </h2>
                            <p className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 animate-fadeInUp stagger-1">
                                See a problem? Fix it in 3 easy steps.
                            </p>
                        </div>

                        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                            {/* Step 1 */}
                            <div className="relative text-center animate-fadeInUp stagger-1">
                                <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-100 rounded-full opacity-50 -z-0"></div>
                                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white border-2 border-indigo-200 rounded-full shadow-lg z-10">
                                    <Smartphone className="w-10 h-10 text-indigo-600" />
                                </div>
                                <h3 className="mt-6 text-2xl font-semibold text-slate-900">1. Snap & Send</h3>
                                <p className="mt-3 text-slate-600">
                                    Open the app, take a photo or voice note of the issue, and add a location. Our app auto-categorizes it for you.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative text-center animate-fadeInUp stagger-2">
                                <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-100 rounded-full opacity-50 -z-0"></div>
                                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white border-2 border-indigo-200 rounded-full shadow-lg z-10">
                                    <Route className="w-10 h-10 text-indigo-600" />
                                </div>
                                <h3 className="mt-6 text-2xl font-semibold text-slate-900">2. Track & Connect</h3>
                                <p className="mt-3 text-slate-600">
                                    Your report is instantly routed to the correct city department. You get real-time status updates from "Received" to "In Progress".
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative text-center animate-fadeInUp stagger-3">
                                <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-100 rounded-full opacity-50 -z-0"></div>
                                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white border-2 border-indigo-200 rounded-full shadow-lg z-10">
                                    <CheckCircle2 className="w-10 h-10 text-indigo-600" />
                                </div>
                                <h3 className="mt-6 text-2xl font-semibold text-slate-900">3. Confirm & Improve</h3>
                                <p className="mt-3 text-slate-600">
                                    Once marked "Resolved," you and your neighbors can verify the fix. Your feedback helps improve city services.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* "Features" Section */}
                <section id="features" className="py-20 sm:py-32 bg-slate-50">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                            {/* --- EDITED CONTENT --- */}
                            <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wide animate-fadeInUp">
                                A Platform for Change
                            </h2>
                            <p className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 animate-fadeInUp stagger-1">
                                More than just reporting.
                                <br />
                                It's about accountability.
                            </p>
                        </div>

                        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className={`p-6 bg-white rounded-2xl shadow-lg shadow-slate-200/50 animate-fadeInUp stagger-${index + 1}`}
                                >
                                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm">
                                        {feature.icon}
                                    </div>
                                    <h3 className="mt-5 text-xl font-semibold text-slate-900">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-slate-600">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Dashboard / Heatmap Section */}
                <section id="dashboard" className="py-20 sm:py-32 bg-white">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                            {/* Image/Mockup Placeholder */}
                            <div className="animate-fadeInUp">
                                <div className="bg-white rounded-2xl shadow-2xl shadow-slate-300/50 p-6 border border-slate-200">
                                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                                        <img
                                            src="https://placehold.co/600x400/e2e8f0/64748b?text=Analytics+Dashboard+Mockup"
                                            alt="CivicTrack Dashboard Mockup"
                                            className="w-full h-full object-cover rounded-lg"
                                            onError={(e) => { e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Error'; }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="animate-fadeInUp stagger-1">
                                <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wide">
                                    Data-Driven Improvements
                                </h2>
                                <p className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
                                    Heatmaps and analytics for city officials.
                                </p>
                                {/* --- EDITED CONTENT --- */}
                                <p className="mt-6 text-lg text-slate-600">
                                    Our platform provides municipalities with a powerful analytics dashboard to visualize
                                    problem hotspots, monitor department performance, and plan
                                    long-term infrastructure improvements based on real-time, citizen-sourced data.
                                </p>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex items-start">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                                        <span className="ml-3 text-slate-600">
                                            Visualize high-impact areas with interactive heatmaps.
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                                        <span className="ml-3 text-slate-600">
                                            Monitor resolution times and department efficiency.
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                                        <span className="ml-3 text-slate-600">
                                            Allocate resources to areas that need them most.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- "Testimonials" Section --- */}
                <section id="community" className="py-20 sm:py-32 bg-slate-50">
                    <div className="container mx-auto max-w-5xl px-4 sm:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wide animate-fadeInUp">
                                Community Voices
                            </h2>
                            <p className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 animate-fadeInUp stagger-1">
                                See what your neighbors are saying.
                            </p>
                        </div>

                        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Testimonial 1 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 animate-fadeInUp stagger-1">
                                <Quote className="w-10 h-10 text-indigo-300" />
                                <blockquote className="mt-6 text-lg text-slate-700 italic">
                                    "A pothole on my street was fixed in 3 days. I reported it on CivicTrack, and I could
                                    actually see when the city assigned it. This is a game-changer."
                                </blockquote>
                                <div className="mt-6 flex items-center">
                                    <img
                                        className="w-12 h-12 rounded-full object-cover"
                                        src="https://placehold.co/100x100/e2e8f0/64748b?text=S.M."
                                        alt="Sarah M."
                                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=S.M.'; }}
                                    />
                                    <div className="ml-4">
                                        <p className="font-semibold text-slate-900">Sarah M.</p>
                                        <p className="text-sm text-slate-500">Local Resident, Springfield</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial 2 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 animate-fadeInUp stagger-2">
                                <Quote className="w-10 h-10 text-indigo-300" />
                                <blockquote className="mt-6 text-lg text-slate-700 italic">
                                    "As a city planner, this tool is invaluable. The data we get from
                                    CivicTrack helps us prioritize our budget and address critical
                                    infrastructure needs before they become emergencies."
                                </blockquote>
                                <div className="mt-6 flex items-center">
                                    <img
                                        className="w-12 h-12 rounded-full object-cover"
                                        src="https://placehold.co/100x100/e2e8f0/64748b?text=D.K."
                                        alt="David K."
                                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=D.K.'; }}
                                    />
                                    <div className="ml-4">
                                        <p className="font-semibold text-slate-900">David K.</p>
                                        <p className="text-sm text-slate-500">City Planner, Maplewood</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* CTA Section */}
                <section id="cta" className="bg-white">
                    <div className="container mx-auto max-w-5xl py-20 sm:py-32 px-4 sm:px-8 text-center">
                        {/* --- EDITED CONTENT --- */}
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 animate-fadeInUp">
                            Be the change in your neighborhood.
                        </h2>
                        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto animate-fadeInUp stagger-1">
                            Download the app or sign up today. Join thousands of citizens
                            working with their city to build a safer, cleaner, and
                            more efficient community.
                        </p>
                        <div className="mt-10 animate-fadeInUp stagger-2">
                            <a
                                href="#"
                                className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
                            >
                                Sign Up Now (It's Free)
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-slate-100 border-t border-slate-200">
                    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-center md:text-left">
                                <a href="#" className="text-xl font-bold text-indigo-700">
                                    CivicTrack
                                </a>
                                {/* --- FIX IS HERE --- */}
                                <p className="mt-2 text-slate-500">
                                    Connecting citizens and cities for a better tomorrow.
                                </p>
                            </div>
                            {/* --- EDITED CONTENT --- */}
                            <nav className="mt-8 md:mt-0 flex gap-x-8 gap-y-4 flex-wrap justify-center">
                                <a href="#features" className="text-slate-600 hover:text-indigo-600">
                                    Features
                                </a>
                                <a href="#" className="text-slate-600 hover:text-indigo-600">
                                    For Citizens
                                </a>
                                <a href="#" className="text-slate-600 hover:text-indigo-600">
                                    For Cities
                                </a>
                                <a href="#" className="text-slate-600 hover:text-indigo-600">
                                    Privacy
                                </a>
                                <a href="#" className="text-slate-600 hover:text-indigo-600">
                                    Contact
                                </a>
                            </nav>
                        </div>
                        <p className="mt-10 text-center text-slate-500 text-sm border-t border-slate-200 pt-8">
                            &copy; {new Date().getFullYear()} CivicTrack. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

