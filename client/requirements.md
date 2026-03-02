## Packages
framer-motion | Essential for premium page transitions, smooth cart drawer animations, and micro-interactions
lucide-react | Standard icons for the e-commerce interface

## Notes
- Images use Unsplash placeholders natively since dynamic image URLs are not guaranteed.
- The UI features a global Cart Drawer orchestrated via a React Context to allow opening from any product page.
- Using native search params and wouter for routing.
- The UI handles gracefully when endpoints throw 404s (such as empty database on first load).
