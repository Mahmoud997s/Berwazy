import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "../shared/schema";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Seeding email templates...");
  
  const templates = [
    {
      name: "welcome",
      subject: "أهلاً بك في {{store_name}} ⚽",
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #000; font-weight: 900; text-transform: uppercase;">مرحباً {{user_name}}!</h1>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">سعيدون جداً بانضمامك لعائلة {{store_name}}. الآن يمكنك تسوق أفضل بوسترات كرة القدم بأعلى جودة.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-[10px]; font-weight: bold; color: #999; text-transform: uppercase;">استمتع بالتسوق،<br>فريق {{store_name}}</p>
          </div>
        </div>
      `,
      description: "يُرسل عند تسجيل مستخدم جديد بنجاح."
    },
    {
      name: "order_confirmation",
      subject: "تأكيد طلبك #{{order_id}} من {{store_name}}",
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #000; font-weight: 900; text-transform: uppercase;">تم استلام طلبك!</h1>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">مرحباً {{user_name}}، شكراً لتسوقك معنا. نحن الآن نقوم بتجهيز طلبك رقم #{{order_id}}.</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 30px 0;">
            <p style="margin: 0; font-weight: bold;">إجمالي الطلب: {{total_amount}}</p>
          </div>
          <p style="font-size: 14px; color: #888;">سنقوم بإخطارك بمجرد شحن الطلب.</p>
        </div>
      `,
      description: "يُرسل فور إتمام عملية الشراء."
    },
    {
      name: "password_reset",
      subject: "رابط استعادة كلمة المرور - {{store_name}}",
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #000; font-weight: 900; text-transform: uppercase;">استعادة كلمة المرور</h1>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">لقد طلبت استعادة كلمة المرور. اضغط على الزر أدناه للمتابعة:</p>
          <a href="{{reset_link}}" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 20px 0;">تغيير كلمة المرور</a>
          <p style="font-size: 12px; color: #999;">إذا لم تطلب هذا، يمكنك تجاهل هذا الإيميل.</p>
        </div>
      `,
      description: "يُرسل عند طلب العميل استعادة كلمة المرور."
    },
    {
      name: "order_status_update",
      subject: "تحديث بخصوص طلبك #{{order_id}} - {{store_name}}",
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #000; font-weight: 900; text-transform: uppercase;">تحديث حالة الطلب</h1>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">مرحباً {{user_name}}، حالة طلبك #{{order_id}} تغيرت الآن إلى:</p>
          <div style="display: inline-block; background: #00c0b5; color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: bold; margin: 20px 0;">{{status_text}}</div>
          <p style="font-size: 14px; color: #888;">يمكنك متابعة تفاصيل الطلب من حسابك في المتجر.</p>
        </div>
      `,
      description: "يُرسل عند تغيير حالة الطلب (شحن، توصيل، إلخ)."
    }
  ];

  for (const template of templates) {
    await db.insert(schema.emailTemplates).values(template as any).onConflictDoUpdate({
      target: [schema.emailTemplates.name],
      set: {
        subject: template.subject,
        body: template.body,
        description: template.description,
        updatedAt: new Date(),
      }
    });
  }
  
  console.log("Templates seeded successfully!");
  await pool.end();
}

seed().catch(console.error);
