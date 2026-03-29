"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  MessageCircle, 
  Truck, 
  CreditCard, 
  Users, 
  Search, 
  Share2, 
  Mail,
  Loader2,
  Save,
  CheckCircle2
} from "lucide-react";

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/settings");
      return res.json();
    }
  });

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      const res = await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/settings"] });
      toast({ title: "Integration Saved", description: "The settings have been updated and are now active." });
    }
  });

  const getSetting = (key: string) => (Array.isArray(settings) ? settings.find(s => s.key === key)?.value : "") || "";

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const sections = [
    {
      title: "Analytics & Tracking",
      description: "Measure your store's performance and track visitor behavior.",
      icon: BarChart3,
      fields: [
        { key: "ga_measurement_id", label: "Google Analytics Measurement ID", placeholder: "G-XXXXXXXXXX", helper: "Track visitors and sales via GA4." },
        { key: "meta_pixel_id", label: "Meta Pixel ID", placeholder: "123456789012345", helper: "Optimise your Facebook and Instagram ads." },
        { key: "gsc_verification_tag", label: "Google Search Console Tag", placeholder: "google-site-verification=...", helper: "Verify ownership in Search Console." },
      ]
    },
    {
      title: "Communication",
      description: "Connect with your customers directly via chat or email.",
      icon: MessageCircle,
      fields: [
        { key: "whatsapp_number", label: "WhatsApp Phone Number", placeholder: "+201XXXXXXXXX", helper: "Include country code without + or spaces." },
        { key: "whatsapp_message", label: "WhatsApp Initial Message", placeholder: "Hi! I have a question about...", helper: "The default message customers will send." },
        { key: "smtp_host", label: "SMTP Host", placeholder: "smtp.gmail.com", helper: "Outgoing mail server address." },
        { key: "smtp_user", label: "SMTP Username", placeholder: "store@gmail.com", helper: "Username for your email service." },
      ]
    },
    {
      title: "Operations & Payments",
      description: "Manage shipping logistics and payment gateway connections.",
      icon: Truck,
      fields: [
        { key: "shipping_api_key", label: "Shipping Partner API Key", placeholder: "sk_live_...", helper: "Connect your shipping provider's dashboard." },
        { key: "payment_stripe_pk", label: "Stripe Public Key", placeholder: "pk_test_...", helper: "Enable secure credit card payments." },
        { key: "crm_webhook_url", label: "CRM Webhook URL", placeholder: "https://hooks.zapier.com/...", helper: "Send customer data to your external CRM." },
      ]
    }
  ];

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Connect <span className="text-primary">Integrations</span></h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Scale your store with third-party services and professional tracking.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">All Systems Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {sections.map((section, idx) => (
          <Card key={idx} className="border-2 border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden group">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  <section.icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black italic uppercase tracking-tighter">{section.title}</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-widest text-muted-foreground/60">{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {section.fields.map(field => (
                  <div key={field.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{field.label}</label>
                      {getSetting(field.key) && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    </div>
                    <div className="relative group/field">
                      <Input 
                        placeholder={field.placeholder}
                        defaultValue={getSetting(field.key)}
                        onBlur={(e) => {
                          if (e.target.value !== getSetting(field.key)) {
                            saveSettingMutation.mutate({ key: field.key, value: e.target.value });
                          }
                        }}
                        className="bg-muted/30 border-2 border-transparent focus:border-primary/30 h-12 rounded-xl text-xs font-bold transition-all px-4"
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 font-medium italic">{field.helper}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-dashed border-border/50 bg-transparent p-10 text-center">
        <Mail className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Custom Integration?</h3>
        <p className="text-xs text-muted-foreground/60 mt-2">Need a specific connection not listed here? Our support team can help.</p>
        <Button variant="outline" className="mt-6 rounded-full px-8 text-[10px] font-black uppercase tracking-[0.2em]">Contact Support</Button>
      </Card>
    </div>
  );
}
