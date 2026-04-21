import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { MainLayout } from '@/components/layout/main-layout';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

import { db } from '@/lib/db';
import { storeSettings } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const storeName = settings.store_name || 'BRAWEZZ.';
  const slogan = settings.store_slogan || 'Premium quality football and abstract posters.';

  return {
    title: {
      default: `${storeName} | ${slogan}`,
      template: `%s | ${storeName}`,
    },
    description: slogan,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    openGraph: {
      type: 'website',
      siteName: storeName,
      title: storeName,
      description: slogan,
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: slogan,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

async function getPublicSettings() {
  const keys = [
    'store_name',
    'navbar_animation',
    'logo_animation',
    'store_slogan',
    'announcement_text',
    'announcement_bg_color',
    'announcement_link_text',
    'announcement_link_url',
    'primary_color',
    'font_family_en',
    'font_family_ar',
    'favicon_url',
    'header_script',
    'footer_script',
    'ga_measurement_id',
    'meta_pixel_id',
    'gsc_verification_tag',
    'whatsapp_number',
    'whatsapp_message'
  ];

  const settings: Record<string, string> = {
    store_name: 'BRAWEZZ.',
    navbar_animation: 'fade',
    logo_animation: 'pulse',
    store_slogan: 'Premium quality football and abstract posters.',
    announcement_text: 'Free worldwide shipping on orders over €100',
    announcement_bg_color: '#000000',
    primary_color: '#DAA520',
    font_family_en: 'Inter',
    font_family_ar: 'Inter',
    favicon_url: '/favicon.ico'
  };

  try {
    const results = await db.select()
      .from(storeSettings);
    
    results.forEach(s => {
      if (keys.includes(s.key) && s.value) {
        settings[s.key] = s.value;
      }
    });
  } catch (error) {
    console.error('[RootLayout] Failed to fetch settings:', error);
  }

  return settings;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();
  const lang = settings.site_language || 'en';
  const dir = settings.site_direction || (lang === 'ar' ? 'rtl' : 'ltr');
  
  // Prepare Google Fonts URL
  const fonts = [];
  if (settings.font_family_en && settings.font_family_en !== 'Inter') fonts.push(settings.font_family_en.replace(' ', '+'));
  if (settings.font_family_ar && settings.font_family_ar !== 'Inter' && settings.font_family_ar !== settings.font_family_en) {
    fonts.push(settings.font_family_ar.replace(' ', '+'));
  }
  const fontsUrl = fonts.length > 0 ? `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}:wght@400;700;900`).join('&')}&display=swap` : '';

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="icon" href={settings.favicon_url || '/favicon.ico'} />
        {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${hexToHsl(settings.primary_color || '#DAA520')};
            --font-en: "${settings.font_family_en}", sans-serif;
            --font-ar: "${settings.font_family_ar}", sans-serif;
          }
          body {
            font-family: var(--font-en);
          }
          [lang="ar"], .font-arabic {
            font-family: var(--font-ar);
          }
        `}} />
        {settings.gsc_verification_tag && (
          <meta name="google-site-verification" content={settings.gsc_verification_tag} />
        )}
        {settings.ga_measurement_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga_measurement_id}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.ga_measurement_id}');
            `}} />
          </>
        )}
        {settings.meta_pixel_id && (
          <script dangerouslySetInnerHTML={{ __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.meta_pixel_id}');
            fbq('track', 'PageView');
          `}} />
        )}
        {settings.header_script && (
          <script dangerouslySetInnerHTML={{ __html: settings.header_script }} />
        )}
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <MainLayout initialSettings={settings}>{children}</MainLayout>
        </Providers>
        {settings.footer_script && (
          <script dangerouslySetInnerHTML={{ __html: settings.footer_script }} />
        )}
        <SpeedInsights />
      </body>
    </html>
  );
}
