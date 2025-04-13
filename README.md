# Pack Together

A modern web application for collaborative trip planning and quick delivery management.

## Features

- 🧳 Trip Planning & Management
- 👥 Collaborative Item Management
- 🚀 Quick Delivery Integration with Swiggy Instamart
- 🔐 User Authentication
- 📱 Responsive Design
- 🌍 Multi-language Support

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Authentication with NextAuth.js
- Vercel Deployment

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pack-together.git
cd pack-together
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
# Required for NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-key # Generate using: openssl rand -base64 32

# App Configuration
NODE_ENV=development
```

For production deployment on Vercel, add these environment variables in your Vercel project settings:
```env
NEXTAUTH_URL=${VERCEL_URL}
NEXTAUTH_SECRET=your-generated-secret-key
NODE_ENV=production
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is optimized for deployment on Vercel. Follow these steps:

1. Push your code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. Import your repository to Vercel:
   - Go to [Vercel](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will automatically detect Next.js

3. Configure environment variables in Vercel:
   - Go to your project settings
   - Add the environment variables listed above
   - Make sure NEXTAUTH_URL is set to your production URL

4. Deploy:
   - Vercel will automatically deploy your main branch
   - Each push to main will trigger a new deployment
   - Preview deployments are created for pull requests

## Troubleshooting

If you encounter deployment issues:

1. Check your environment variables in Vercel
2. Ensure all dependencies are properly listed in package.json
3. Check the build logs in Vercel for specific errors
4. Verify your Next.js configuration in next.config.js
5. Make sure authentication is properly configured

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.
