import React from 'react';

export const EventFooter = () => {
  return (
    <footer className="bg-black text-white py-20 border-t border-white/10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 flex items-center justify-center text-white">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="/logo.svg" alt="Event Architect Logo" className="w-full h-full" />
             </div>
             <h3 className="text-xl font-heading font-bold text-white">EventManage.ai</h3>
          </div>
          <p className="text-neutral-400 max-w-md">
            Coordination replaces competition when networks can see themselves.
            <br />
            Powered by WeRhiz.
          </p>
          <div className="flex gap-4">
             {/* Social placeholders */}
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer">𝕏</div>
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer">in</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Event Info</h4>
          <ul className="space-y-2 text-neutral-300">
             <li><a href="#" className="hover:text-white transition-colors">About WeRhiz</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Code of Conduct</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Venue Details</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Safety Protocols</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Partners</h4>
           <div className="flex flex-wrap gap-4">
              <span className="text-xl font-bold text-white/40 hover:text-white/80 transition-colors">Greylock</span>
              <span className="text-xl font-bold text-white/40 hover:text-white/80 transition-colors">Ethereum Foundation</span>
              <span className="text-xl font-bold text-white/40 hover:text-white/80 transition-colors">OpenExO</span>
           </div>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-20 pt-8 border-t border-white/5 text-center text-neutral-600 text-sm">
        © 2025 Rhiz Protocol. All rights reserved.
      </div>
    </footer>
  );
};
