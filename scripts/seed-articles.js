const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5432/football_posters";
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const articles = [
    {
        title: "How to Choose the Perfect Frame for Your Home Decor",
        slug: "how-to-choose-the-perfect-frame",
        excerpt: "A comprehensive guide to selecting frames that highlight your art and complement your furniture design.",
        imageName: "home_decor_frames",
        content: `
            <p>Choosing a frame is just as important as choosing the poster itself. The frame is the final touch that gives the artwork its character and integrates it into the room's decor.</p>
            <h3>1. Natural Wood Frames</h3>
            <p>Providing a sense of warmth and comfort, these fit perfectly with modern and rustic designs. If your furniture has wooden accents, this is your best bet.</p>
            <h3>2. Elegant Black Frames</h3>
            <p>Offering a sleek and powerful look, these are best for minimalist and cinematic posters as they highlight color contrast and define the image professionally.</p>
            <h3>3. Modern White Frames</h3>
            <p>Giving a sense of space and cleanliness, they are ideal for colored walls or when you want the viewer to focus on the details of the painting without any external distraction.</p>
            <p>At BRAWEZZ, we provide a variety of premium frame options that ensure your posters are protected and their beauty is highlighted for years to come.</p>
        `
    },
    {
        title: "Minimalist Cinema Posters: Art in Its Simplest Form",
        slug: "minimalist-cinema-posters-art",
        excerpt: "Why is the new trend in design based on simplifying the greatest films into a single symbol?",
        imageName: "minimal_movie_poster",
        content: `
            <p>The new trend in cinema is simplifying the idea into a single symbol. Minimalist posters are not just simple designs; they are a challenge for the designer to condense a whole movie story into one visual element.</p>
            <p>Why do designers prefer this style?</p>
            <ul>
                <li><strong>Clarity:</strong> It communicates the idea at lightning speed.</li>
                <li><strong>Aesthetics:</strong> It adds a sophisticated artistic touch to your room without visual clutter.</li>
                <li><strong>Mystery:</strong> It prompts the viewer to think about the meaning of the symbol used.</li>
            </ul>
            <p>Whether you're a fan of sci-fi or classic drama, a minimalist poster is a piece of decor that proves you're a true connoisseur of art and cinema.</p>
        `
    },
    {
        title: "Turn Your Memories into Art: The Power of Custom Posters",
        slug: "turn-memories-into-art",
        excerpt: "How to convert your travel photos or personal memories into professional wall art for your home.",
        imageName: "custom_memory_poster",
        content: `
            <p>Nothing beats a piece of art that holds a special memory for you. Photos stored on phones are often forgotten, but turning them into a printed poster makes them part of your daily life.</p>
            <p>Custom design service at BRAWEZZ allows you to:</p>
            <ul>
                <li>Improve the quality of old or low-resolution photos.</li>
                <li>Add artistic touches (classic filters, digital painting, or custom text).</li>
                <li>Choose sizes that precisely fit your wall space.</li>
            </ul>
            <p>Start now by turning your most beautiful moments with family or friends into artistic icons that you're proud to display in your home.</p>
        `
    },
    {
        title: "Football Posters: Stadium Passion on Your Walls",
        slug: "football-posters-passion-on-walls",
        excerpt: "Express your love for your favorite team through artistic posters that go beyond traditional photography.",
        imageName: "football_art_poster",
        content: `
            <p>Football is more than just a sport; it's a culture and a sense of belonging. Keeping an image of your favorite player or a championship moment is part of that passion.</p>
            <p>At BRAWEZZ, we believe a football poster should be a piece of art, not just a photograph. We use artistic styles such as:</p>
            <ul>
                <li><strong>Graffiti Art:</strong> To give a sense of energy and movement.</li>
                <li><strong>Digital Oil Paintings:</strong> For a luxurious and classic look.</li>
                <li><strong>Infographics:</strong> To visually explain a player's career or a club's history.</li>
            </ul>
        `
    },
    {
        title: "The Magic of Music: Vintage Posters that Play in Your Room",
        slug: "music-magic-vintage-posters",
        excerpt: "From vinyl records to legendary concert posters, learn how to design your own music corner.",
        imageName: "music_vintage_posters",
        content: `
            <p>Wall art related to music reflects your refined taste and creates an inspiring atmosphere in the room. Whether you play an instrument or are just a passionate listener, your walls should speak your music.</p>
            <p>Ideas for coordinating music posters:</p>
            <ul>
                <li>Create a Gallery Wall featuring different bands.</li>
                <li>Use dark wooden frames to enhance the vintage or classic vibe.</li>
                <li>Distribute posters next to your speaker or instrument corner.</li>
            </ul>
            <p>Discover the BRAWEZZ music collection and start building your own home theater.</p>
        `
    },
    {
        title: "Nature at Home: Botanical Art Trends",
        slug: "botanical-art-nature-at-home",
        excerpt: "The latest leaf and landscape trends that give your home a fresh, vibrant new life.",
        imageName: "botanical_nature_posters",
        content: `
            <p>Plants bring life to your home, and Botanical Art gives it soul. These designs are the most sought-after in modern decor for their ability to create a calm and relaxing environment.</p>
            <h3>Why Choose Botanical Art?</h3>
            <p>Simply because it never goes out of style. Monstera leaves, pine forests, or even desert plant designs add a touch of nature without the need for daily care.</p>
            <p>Designers recommend placing these posters in relaxation areas like bedrooms or reading corners.</p>
        `
    },
    {
        title: "Psychology of Colors: Choosing Art that Boosts Your Mood",
        slug: "psychology-of-colors-wall-art",
        excerpt: "How the colors of paintings affect our psychological state, and how to choose the right color for each room.",
        imageName: "color_psychology_art",
        content: `
            <p>Have you ever felt calm when looking at a blue painting? Or energetic when seeing a bright orange color? This is the science of color psychology.</p>
            <ul>
                <li><strong>Blue:</strong> Helps with focus and calmness, ideal for offices and bedrooms.</li>
                <li><strong>Yellow and Green:</strong> Exude optimism and vitality, great for living rooms and kitchens.</li>
                <li><strong>Neutral Colors:</strong> Provide a sense of luxury and balance.</li>
            </ul>
            <p>In our store, we care about color grading and print quality to ensure the painting achieves its aesthetic and psychological purpose in your home.</p>
        `
    },
    {
        title: "Office Art: Boosting Productivity in Your Workspace",
        slug: "office-posters-productivity-boost",
        excerpt: "Your environment directly impacts your productivity. Learn how to choose art that inspires your work.",
        imageName: "office_productivity_poster",
        content: `
            <p>With the increase in remote work, designing a home office has become a necessity, not a luxury. Empty walls can be boring and lead to mental sluggishness.</p>
            <p>How to choose a poster for your office?</p>
            <ol>
                <li>Choose inspiring quotes but in a sleek typographic design.</li>
                <li>Use wide landscapes to reduce eye strain when taking breaks from the screen.</li>
                <li>Avoid overly busy colors that might distract you.</li>
            </ol>
            <p>Turn your workspace into a zone of creativity with BRAWEZZ posters tailored for professionals.</p>
        `
    },
    {
        title: "Art as a Gift: Why a Custom Poster is the Best Choice",
        slug: "art-as-a-gift-why-posters",
        excerpt: "The gift that lasts longest is the one that leaves an impact. Creative ideas for unique, unforgettable gifts.",
        imageName: "gift_personalized_art",
        content: `
            <p>Searching for the perfect gift is a difficult process, but art is always the solution. A custom poster is more than just a gift; it's a message that says, "I thought of you and what you love."</p>
            <p>Art gift ideas:</p>
            <ul>
                <li><strong>Wedding:</strong> A poster featuring the date of the first meeting or the event's coordinates.</li>
                <li><strong>Graduation:</strong> A poster that artistically embodies the student's ambition or field of study.</li>
                <li><strong>New Home:</strong> An abstract piece that welcomes guests and completes the home decor.</li>
            </ul>
            <p>Our premium packaging and quality materials make BRAWEZZ your first destination for art gifts.</p>
        `
    },
    {
        title: "Modern Abstract Art: A Contemporary Touch for Every Corner",
        slug: "modern-abstract-art-style",
        excerpt: "Abstract art offers infinite interpretations. Learn how to choose an abstract piece that matches your modern style.",
        imageName: "abstract_luxury_poster_art",
        content: `
            <p>Abstract art is a visual language based on shapes, colors, and lines. The advantage of this type of art is that it changes with the room's lighting and the angle of view.</p>
            <p>How to coordinate abstract art?</p>
            <p>Don't hesitate to choose oversized paintings to be the centerpiece of the hall. You can also combine several small abstract paintings with matching colors to create a harmonious art wall.</p>
            <p>Our new collection of abstract art features touches of gold and silver to add instant luxury to any space.</p>
        `
    }
];

const imageMap = {
    "home_decor_frames": "home_decor_frames_1773177833904.png",
    "minimal_movie_poster": "minimal_movie_poster_1773177852158.png",
    "custom_memory_poster": "custom_memory_poster_1773177867914.png",
    "football_art_poster": "football_art_poster_1773177885831.png",
    "music_vintage_posters": "music_vintage_posters_1773177901011.png",
    "botanical_nature_posters": "botanical_nature_posters_1773177924236.png",
    "color_psychology_art": "color_psychology_art_1773177938992.png",
    "office_productivity_poster": "office_productivity_poster_1773177956456.png",
    "gift_personalized_art": "gift_personalized_art_1773177975279.png",
    "abstract_luxury_poster_art": "abstract_luxury_poster_art_1773177992168.png"
};

const BRAIN_DIR = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\294837fe-6931-4689-962c-f62b7acf4226";
const AUTHOR_ID = 1;

async function seed() {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    console.log("Connected to database.");

    try {
        // Clear existing blog posts to avoid duplicates and replace with English content
        console.log("Clearing existing blog posts...");
        await client.query("DELETE FROM blog_posts");
        
        for (const article of articles) {
            const sourceFile = path.join(BRAIN_DIR, imageMap[article.imageName]);
            const targetFilename = `${article.imageName}-${Date.now()}.png`;
            const targetPath = path.join(UPLOADS_DIR, targetFilename);

            if (fs.existsSync(sourceFile)) {
                fs.copyFileSync(sourceFile, targetPath);
                const stats = fs.statSync(targetPath);
                const url = `/uploads/${targetFilename}`;

                const mediaRes = await client.query(
                    `INSERT INTO media (filename, original_name, mime_type, size, url, alt_text, created_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
                    [targetFilename, `${article.imageName}.png`, 'image/png', stats.size, url, article.title]
                );
                
                const mediaId = mediaRes.rows[0].id;

                await client.query(
                    `INSERT INTO blog_posts (slug, title, content, excerpt, image_url, author_id, is_published, published_at, seo_title, seo_description, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, NOW(), NOW())`,
                    [
                        article.slug, 
                        article.title, 
                        article.content.trim(), 
                        article.excerpt, 
                        url, 
                        AUTHOR_ID, 
                        true, 
                        article.title, 
                        article.excerpt
                    ]
                );
                console.log(`Seeded English article: ${article.title}`);
            }
        }
    } catch (err) {
        console.error("Error during seeding:", err);
    } finally {
        await client.end();
        console.log("Database connection closed.");
    }
}

seed();
