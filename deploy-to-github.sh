#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         eCalc RO - GitHub Deployment Script                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

echo "📦 Initializing Git repository..."
cd /app

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Add all files
echo "📝 Adding all files..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "eCalc RO MVP - Production Ready with 3 Monetization Improvements

- 18 affiliate slots (3 per calculator)
- 4 AdSense positions (including prime Above/Below Results slots)
- Dynamic tax labels (future-proof)
- Complete admin dashboard
- Lead generation with CSV export
- MongoDB integration
- Responsive design
- SEO optimized

Revenue Potential: €1700-3800/month"

echo "✅ Commit created"
echo ""

# Set main branch
git branch -M main

echo "🔗 Setting up remote repository..."
echo ""
echo "⚠️  ACTION REQUIRED:"
echo ""
echo "I need your GitHub username to proceed."
echo "Please enter your GitHub username:"
read -p "Username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ No username provided. Exiting."
    exit 1
fi

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo "📌 Remote 'origin' already exists. Removing..."
    git remote remove origin
fi

# Add remote
REPO_URL="https://github.com/$GITHUB_USERNAME/ecalc-ro.git"
git remote add origin $REPO_URL
echo "✅ Remote added: $REPO_URL"
echo ""

echo "🚀 Ready to push!"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "IMPORTANT: You need to authenticate with GitHub"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Option 1: GitHub CLI (Recommended)"
echo "  gh auth login"
echo "  git push -u origin main"
echo ""
echo "Option 2: Personal Access Token"
echo "  Create token at: https://github.com/settings/tokens"
echo "  Use token as password when prompted"
echo ""
echo "Option 3: SSH (if configured)"
echo "  git remote set-url origin git@github.com:$GITHUB_USERNAME/ecalc-ro.git"
echo "  git push -u origin main"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Attempting to push now..."
echo ""

# Try to push
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  🎉 SUCCESS! Code pushed to GitHub!                           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Repository URL: https://github.com/$GITHUB_USERNAME/ecalc-ro"
    echo ""
    echo "Next Steps:"
    echo "  1. Go to: https://vercel.com/new"
    echo "  2. Import repository: ecalc-ro"
    echo "  3. Add environment variables (see DEPLOYMENT_GUIDE.md)"
    echo "  4. Deploy!"
    echo ""
    echo "Your site will be live in ~3 minutes! 🚀"
else
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ⚠️  Push failed - Authentication required                     ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Please authenticate with one of these methods:"
    echo ""
    echo "METHOD 1: Personal Access Token (Easiest)"
    echo "  1. Go to: https://github.com/settings/tokens/new"
    echo "  2. Name: 'eCalc RO Deploy'"
    echo "  3. Scopes: Check 'repo' (full control)"
    echo "  4. Generate token and copy it"
    echo "  5. Run: git push -u origin main"
    echo "  6. Username: $GITHUB_USERNAME"
    echo "  7. Password: [paste your token]"
    echo ""
    echo "METHOD 2: GitHub CLI"
    echo "  1. Install: https://cli.github.com/"
    echo "  2. Run: gh auth login"
    echo "  3. Run: git push -u origin main"
    echo ""
    echo "METHOD 3: Manual Upload (No Terminal Needed)"
    echo "  1. Go to: https://github.com/$GITHUB_USERNAME/ecalc-ro"
    echo "  2. Click: 'uploading an existing file'"
    echo "  3. Drag & drop /app folder"
    echo "  4. Commit!"
    echo ""
fi

echo ""
echo "For detailed instructions, see: GITHUB_DEPLOY.md"
echo ""
