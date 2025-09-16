# LearnLedger API Documentation

This repository contains the API documentation for LearnLedger, a blockchain-based project management system.

## Deploying the API Documentation

You have several options for deploying the API documentation:

### Option 1: Deploy to Netlify (Easiest)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-repo/project-ledger)

1. Click the "Deploy to Netlify" button above
2. Follow the instructions to fork or clone the repository
3. Netlify will automatically build and deploy the static documentation

### Option 2: Deploy to GitHub Pages

1. Fork this repository
2. Go to Settings > Pages in your forked repository
3. Select the branch you want to deploy (e.g., `main`)
4. Select the `/static` folder as the root directory
5. Click "Save"

GitHub will automatically build and deploy your site.

### Option 3: Deploy to Vercel

1. Fork this repository
2. Import the repository into Vercel
3. Set the build command to `npm run static-docs`
4. Set the output directory to `static`
5. Click "Deploy"

### Option 4: Manual Deployment

1. Run `npm run static-docs` to generate the static documentation
2. Upload the contents of the `static` directory to any static hosting service

## Development

### Prerequisites

- Node.js 14+ and npm

### Installation

```bash
npm install
```

### Generate Documentation

```bash
npm run static-docs
```

This will generate the static documentation in the `static` directory.

### Customization

- **API Schema**: Edit `scripts/export-static-docs.js` to modify the OpenAPI schema
- **Documentation UI**: Edit `static/index.html` to customize the UI
- **How-to Guide**: Edit `static/how-to-use.html` to update the guide

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, contact support@LearnLedger.com.
