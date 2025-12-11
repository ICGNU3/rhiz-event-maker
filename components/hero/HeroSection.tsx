import React from 'react';
import { HeroTheme, THEMES } from './theme';
import { BackgroundSystem } from './BackgroundSystem';
import { InteractiveNetworkBackground } from './InteractiveNetworkBackground';
import styles from './hero.module.css';

export interface HeroProps {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  backgroundImage?: string;
  primaryAction: { label: string; onClick: () => void };
  theme: HeroTheme;
  isEditing?: boolean;
  onUpdate?: (field: string, value: string) => void;
}

export const HeroSection: React.FC<HeroProps> = ({
  title,
  subtitle,
  date,
  location,
  backgroundImage,
  primaryAction,
  theme,
  isEditing = false,
  onUpdate,
}) => {
  const themeConfig = THEMES[theme];
  
  // Inline styles for theme-dynamic values
  const containerStyle = {
    color: themeConfig.colors.text.primary,
    fontFamily: themeConfig.typography.subtitle.split(';')[0].replace('font-family:', '').trim(),
    '--theme-accent': themeConfig.colors.text.accent,
    '--theme-bg': themeConfig.colors.background,
  } as React.CSSProperties;

  const titleStyle = {
      fontFamily: themeConfig.typography.title.match(/font-family:([^;]+)/)?.[1]?.trim(),
  } as React.CSSProperties;

  return (
    <section 
      className="relative w-full h-[700px] flex items-center justify-center overflow-hidden" 
      style={containerStyle}
    >
      {/* Background System */}
      {backgroundImage === 'dynamic-network' ? (
        <InteractiveNetworkBackground />
      ) : (
        <BackgroundSystem theme={theme} backgroundImage={backgroundImage} />
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
          
          {/* Main Text Content */}
          <div className={`col-span-1 lg:col-span-8 flex flex-col gap-6 
             ${theme === 'professional' ? 'lg:text-left text-center items-center lg:items-start' : ''}
             ${theme === 'vibrant' ? 'lg:text-center text-center items-center' : ''}
             ${theme === 'luxury' ? 'lg:text-center text-center items-center' : ''}
          `}>
             
             {/* Date & Location Tag */}
             <div 
               className={`${styles.animateEntrance} text-sm md:text-base tracking-wider mb-2`}
               style={{ 
                   color: themeConfig.colors.text.accent, 
                   fontFamily: themeConfig.typography.meta.match(/font-family:([^;]+)/)?.[1]
               }}
             >
                {isEditing ? (
                  <div className="flex gap-2">
                    <input 
                      value={date} 
                      onChange={(e) => onUpdate?.('date', e.target.value)}
                      className="bg-black/50 border border-white/20 rounded px-2 py-1 text-inherit w-32"
                    />
                    <span>•</span>
                    <input 
                      value={location} 
                      onChange={(e) => onUpdate?.('location', e.target.value)}
                      className="bg-black/50 border border-white/20 rounded px-2 py-1 text-inherit w-48"
                    />
                  </div>
                ) : (
                  <>{date} • {location}</>
                )}
             </div>

             {/* Title */}
             {isEditing ? (
                <textarea 
                  value={title}
                  onChange={(e) => onUpdate?.('eventName', e.target.value)}
                  className="w-full bg-black/20 text-5xl md:text-7xl lg:text-8xl font-bold border border-white/20 rounded p-2 text-inherit resize-none overflow-hidden"
                  rows={2}
                  style={{...titleStyle}}
                />
             ) : (
               <h1 
                 className={`${styles.animateEntrance} ${styles.delay100} text-5xl md:text-7xl lg:text-8xl leading-[0.95] drop-shadow-2xl`}
                 style={{
                     ...titleStyle, 
                     color: themeConfig.colors.text.primary,
                 }}
               >
                  <span style={{ 
                      fontWeight: theme === 'vibrant' ? 800 : (theme === 'professional' ? 700 : 400),
                      fontStyle: theme === 'luxury' ? 'italic' : 'normal',
                      letterSpacing: theme === 'professional' ? '-0.02em' : (theme === 'vibrant' ? '-0.01em' : '0em')
                  }}>
                     {title}
                  </span>
               </h1>
             )}

             {/* Subtitle */}
             {isEditing ? (
                <textarea 
                  value={subtitle}
                  onChange={(e) => onUpdate?.('tagline', e.target.value)}
                  className="w-full bg-black/20 text-lg md:text-2xl border border-white/20 rounded p-2 text-inherit resize-none"
                  rows={2}
                />
             ) : (
               <p 
                 className={`${styles.animateEntrance} ${styles.delay200} text-lg md:text-2xl opacity-90 max-w-2xl`}
                 style={{ 
                     color: themeConfig.colors.text.secondary,
                     fontFamily: themeConfig.typography.subtitle.match(/font-family:([^;]+)/)?.[1]
                 }}
               >
                 {subtitle}
               </p>
             )}

            {/* CTA Button */}
            <div className={`mt-8 ${styles.animateEntrance} ${styles.delay300}`}>
               <button
                 disabled={isEditing}
                 onClick={primaryAction.onClick}
                 data-theme={theme}
                 className={`
                    ${styles.heroButton} 
                    px-8 py-4 
                    text-base md:text-lg 
                    font-bold 
                    tracking-wide
                    cursor-pointer
                    ${theme === 'professional' ? 'rounded-md' : (theme === 'vibrant' ? 'rounded-full' : 'rounded-none')}
                    ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}
                 `}
                 style={{
                     backgroundColor: themeConfig.colors.button.bg,
                     color: themeConfig.colors.button.text,
                 }}
               >
                 <span className="relative z-10">{primaryAction.label}</span>
               </button>
            </div>
          </div>

          <div className="hidden lg:block col-span-4">
          </div>
          
        </div>
      </div>
    </section>
  );
};
