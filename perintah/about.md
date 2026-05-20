You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
about.tsx
"use client";

import React from "react";

export default function Example() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            <h1 className="text-3xl font-semibold text-center mx-auto">About our apps</h1>
            <p className="text-sm text-slate-500 text-center mt-2 max-w-lg mx-auto">
                A visual collection of our most recent works - each piece crafted with intention, emotion and style.
            </p>
            <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 px-8 md:px-0 pt-16">
                <div className="size-[520px] -top-80 left-1/2 -translate-x-1/2 rounded-full absolute blur-[300px] -z-10 bg-[#FBFFE1]"></div>
                <div>
                    <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/flashEmoji.png" alt="" />
                    </div>
                    <div className="mt-5 space-y-2">
                        <h3 className="text-base font-medium text-slate-600">Lightning-Fast Performance</h3>
                        <p className="text-sm text-slate-500">Built with speed — minimal load times and optimized.</p>
                    </div>
                </div>
                <div>
                    <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/colorsEmoji.png" alt="" />
                    </div>
                    <div className="mt-5 space-y-2">
                        <h3 className="text-base font-medium text-slate-600">Beautifully Designed Components</h3>
                        <p className="text-sm text-slate-500">Modern, pixel-perfect UI components ready for any project.</p>
                    </div>
                </div>
                <div>
                    <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/puzzelEmoji.png" alt="" />
                    </div>
                    <div className="mt-5 space-y-2">
                        <h3 className="text-base font-medium text-slate-600">Plug-and-Play Integration</h3>
                        <p className="text-sm text-slate-500">Simple setup with support for React, Next.js and Tailwind css.</p>
                    </div>
                </div>
                <div>
                    <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/bookEmoji.png" alt="" />
                    </div>
                    <div className="mt-5 space-y-2">
                        <h3 className="text-base font-medium text-slate-600">Clear & Comprehensive</h3>
                        <p className="text-sm text-slate-500">Get started fast with usage examples, live previews and code.</p>
                    </div>
                </div>
                <div>
                    <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/boxEmoji.png" alt="" />
                    </div>
                    <div className="mt-5 space-y-2">
                        <h3 className="text-base font-medium text-slate-600">Fully Customizable</h3>
                        <p className="text-sm text-slate-500">Easily adapt styles, colors and layout to match your brand or product.</p>
                    </div>
                </div>
                <div>
                    <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/brainEmoji.png" alt="" />
                    </div>
                    <div className="mt-5 space-y-2">
                        <h3 className="text-base font-medium text-slate-600">Accessibility First</h3>
                        <p className="text-sm text-slate-500">Built with WCAG standards in mind to ensure inclusive user experiences.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

demo.tsx
"use client";

import React from "react";

export default function Example() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16">
      {/* soft glow background */}
      <div
        className="pointer-events-none absolute -top-64 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#FBFFE1] blur-[300px] -z-10"
        aria-hidden
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* header */}
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl font-semibold">About our apps</h1>
        <p className="mt-2 text-sm md:text-base text-slate-500">
          A visual collection of our most recent works — each piece crafted with
          intention, emotion and style.
        </p>
      </header>

      {/* grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/flashEmoji.png"
          title="Lightning-Fast Performance"
          desc="Built with speed — minimal load times and optimized."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/colorsEmoji.png"
          title="Beautifully Designed Components"
          desc="Modern, pixel-perfect UI components ready for any project."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/puzzelEmoji.png"
          title="Plug-and-Play Integration"
          desc="Simple setup with support for React, Next.js and Tailwind CSS."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/bookEmoji.png"
          title="Clear & Comprehensive"
          desc="Get started fast with usage examples, live previews and code."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/boxEmoji.png"
          title="Fully Customizable"
          desc="Easily adapt styles, colors and layout to match your brand or product."
        />
        <Feature
          icon="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/brainEmoji.png"
          title="Accessibility First"
          desc="Built with WCAG standards in mind to ensure inclusive experiences."
        />
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-xl border border-slate-200/60 bg-white/50 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="size-10 shrink-0 rounded bg-indigo-50 border border-indigo-200 p-2">
        <img src={icon} alt="" className="h-full w-full object-contain" />
      </div>
      <div>
        <h3 className="text-base font-medium text-slate-700">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
