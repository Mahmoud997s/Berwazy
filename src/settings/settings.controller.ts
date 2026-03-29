import { Controller, Get } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly adminService: AdminService) {}

  @Get('public')
  async getPublicSettings() {
    const settings = await this.adminService.getStoreSettings();
    // Return only non-sensitive settings
    const publicKeys = [
      'store_name',
      'navbar_animation',
      'logo_animation',
      'store_slogan',
      'navbar_transparent',
      'primary_color',
      'free_shipping_min',
      'announcement_text',
      'announcement_bg_color',
      'announcement_link_text',
      'announcement_link_url',
      'logo_url',
      'favicon_url',
      'font_family_en',
      'font_family_ar',
      'social_facebook',
      'social_instagram',
      'social_twitter',
      'social_tiktok',
      'header_script',
      'footer_script',
      'navbar_icon_style'
    ];
    
    const publicSettings: Record<string, string> = {};
    settings.forEach(s => {
      if (publicKeys.includes(s.key)) {
        publicSettings[s.key] = s.value;
      }
    });

    // Defaults if not set
    if (!publicSettings['store_name']) publicSettings['store_name'] = 'BRAWEZZ.';
    if (!publicSettings['navbar_animation']) publicSettings['navbar_animation'] = 'fade';
    if (!publicSettings['logo_animation']) publicSettings['logo_animation'] = 'pulse';
    if (!publicSettings['announcement_text']) publicSettings['announcement_text'] = 'Free worldwide shipping on orders over €100';
    if (!publicSettings['announcement_bg_color']) publicSettings['announcement_bg_color'] = '#000000';
    if (!publicSettings['announcement_link_text']) publicSettings['announcement_link_text'] = '';
    if (!publicSettings['announcement_link_url']) publicSettings['announcement_link_url'] = '';
    if (!publicSettings['primary_color']) publicSettings['primary_color'] = '#DAA520'; // Gold default
    if (!publicSettings['font_family_en']) publicSettings['font_family_en'] = 'Inter';
    if (!publicSettings['font_family_ar']) publicSettings['font_family_ar'] = 'Inter'; // Fallback to Inter if not set
    if (!publicSettings['navbar_icon_style']) publicSettings['navbar_icon_style'] = 'minimal';
    if (!publicSettings['logo_url']) publicSettings['logo_url'] = '';
    if (!publicSettings['favicon_url']) publicSettings['favicon_url'] = '/favicon.ico';

    return publicSettings;
  }
}
