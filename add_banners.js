const { Client } = require('pg');

async function addBanners() {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_FM3DAHI6NXye@ep-soft-rain-a8aaymn9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
    });

    try {
        await client.connect();
        console.log("Connected to Neon.");

        const bannerData = [
            {
                title: "Classic Football Collection",
                subtitle: "Experience the history of the beautiful game",
                image_url: "/uploads/products/haaland-man-city-fodbold-plakat-0.jpg",
                link_url: "/collections/classic",
                link_text: "Shop Now",
                sort: 1
            },
            {
                title: "Limited Edition Posters",
                subtitle: "Exclusive designs for true fans",
                image_url: "/uploads/products/mohamed-salah-fodbold-plakat-0.jpg",
                link_url: "/collections/limited",
                link_text: "View Collection",
                sort: 2
            }
        ];

        for (const b of bannerData) {
            await client.query(
                `INSERT INTO banners (title, subtitle, image_url, link_url, link_text, sort, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, true)`,
                [b.title, b.subtitle, b.image_url, b.link_url, b.link_text, b.sort]
            );
        }

        console.log("✅ Sample Banners added to Neon!");

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
}

addBanners();
