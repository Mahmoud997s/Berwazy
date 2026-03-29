const { Client } = require('pg');

async function checkBlog() {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_FM3DAHI6NXye@ep-soft-rain-a8aaymn9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
    });

    try {
        await client.connect();
        console.log("Connected to Neon.");

        const res = await client.query("SELECT id, title, image_url FROM blog_posts LIMIT 5;");
        console.log("Blog Posts:", JSON.stringify(res.rows, null, 2));

        const res2 = await client.query("SELECT id, image_url FROM banners LIMIT 5;");
        console.log("Banners:", JSON.stringify(res2.rows, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
}

checkBlog();
