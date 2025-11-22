#!/bin/bash
# ===========================================
# EVA Framework - NPM Publish Script
# ===========================================

set -e  # Exit on error

echo "🚀 EVA Framework - Publication sur NPM"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if logged in to npm
echo "🔍 Vérification de la connexion NPM..."
if ! npm whoami &> /dev/null; then
    echo -e "${RED}❌ Vous n'êtes pas connecté à NPM${NC}"
    echo "Veuillez vous connecter avec: npm login"
    exit 1
fi

NPM_USER=$(npm whoami)
echo -e "${GREEN}✓ Connecté en tant que: ${NPM_USER}${NC}"
echo ""

# Build eva-css
echo "🔨 Build de @eva/css..."
cd packages/eva-css
pnpm build &> /dev/null
pnpm build:min &> /dev/null
echo -e "${GREEN}✓ Build terminé${NC}"
cd ../..
echo ""

# Verify package contents
echo "📦 Vérification des packages..."
echo ""

echo "  @eva/colors:"
cd packages/eva-colors
npm pack --dry-run 2>&1 | grep "package size\|total files" | sed 's/npm notice /    /'
cd ../..

echo "  @eva/css:"
cd packages/eva-css
npm pack --dry-run 2>&1 | grep "package size\|total files" | sed 's/npm notice /    /'
cd ../..

echo "  @eva/purge:"
cd packages/eva-purge
npm pack --dry-run 2>&1 | grep "package size\|total files" | sed 's/npm notice /    /'
cd ../..

echo ""
echo -e "${YELLOW}⚠️  Êtes-vous prêt à publier ces packages sur NPM ?${NC}"
echo "   Cette action est irréversible !"
echo ""
read -p "Taper 'yes' pour continuer: " -r
echo ""

if [[ ! $REPLY =~ ^yes$ ]]; then
    echo -e "${RED}❌ Publication annulée${NC}"
    exit 1
fi

# Publish packages
echo "📤 Publication des packages..."
echo ""

echo "  Publishing @eva/colors..."
cd packages/eva-colors
npm publish
echo -e "${GREEN}✓ @eva/colors publié${NC}"
cd ../..

echo "  Publishing @eva/css..."
cd packages/eva-css
npm publish
echo -e "${GREEN}✓ @eva/css publié${NC}"
cd ../..

echo "  Publishing @eva/purge..."
cd packages/eva-purge
npm publish
echo -e "${GREEN}✓ @eva/purge publié${NC}"
cd ../..

echo ""
echo -e "${GREEN}🎉 Tous les packages ont été publiés avec succès !${NC}"
echo ""
echo "📝 Prochaines étapes recommandées:"
echo "   1. Créer un tag git: git tag v1.0.0 && git push --tags"
echo "   2. Vérifier sur NPM:"
echo "      - https://www.npmjs.com/package/@eva/colors"
echo "      - https://www.npmjs.com/package/@eva/css"
echo "      - https://www.npmjs.com/package/@eva/purge"
echo ""
