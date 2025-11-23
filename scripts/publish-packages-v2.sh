#!/bin/bash
# ===========================================
# EVA Framework - NPM Publish Script v2
# With automatic version bump
# ===========================================

set -e  # Exit on error

echo "🚀 EVA Framework - Publication sur NPM"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

# Get current versions
echo "📊 Versions actuelles des packages:"
echo ""

declare -A PACKAGES
declare -A CURRENT_VERSIONS

PACKAGES=(
    ["eva-colors"]="packages/eva-colors"
    ["eva-css-fluid"]="packages/eva-css"
    ["eva-css-purge"]="packages/eva-purge"
    ["create-eva-css"]="packages/create-eva-css"
)

for pkg_name in "${!PACKAGES[@]}"; do
    pkg_path="${PACKAGES[$pkg_name]}"
    version=$(node -p "require('./$pkg_path/package.json').version")
    CURRENT_VERSIONS[$pkg_name]=$version
    echo -e "  ${CYAN}$pkg_name${NC}: v$version"
done

echo ""

# Ask for version bump type
echo -e "${YELLOW}🔢 Quel type de version bump souhaitez-vous ?${NC}"
echo ""
echo "  1) patch   - 2.0.0 → 2.0.1 (bug fixes)"
echo "  2) minor   - 2.0.0 → 2.1.0 (new features, backwards compatible)"
echo "  3) major   - 2.0.0 → 3.0.0 (breaking changes)"
echo "  4) custom  - Spécifier une version manuellement"
echo "  5) skip    - Garder les versions actuelles (ne pas bumper)"
echo ""
read -p "Votre choix (1-5): " version_choice
echo ""

BUMP_TYPE=""
CUSTOM_VERSION=""

case $version_choice in
    1)
        BUMP_TYPE="patch"
        echo -e "${GREEN}✓ Version bump: patch${NC}"
        ;;
    2)
        BUMP_TYPE="minor"
        echo -e "${GREEN}✓ Version bump: minor${NC}"
        ;;
    3)
        BUMP_TYPE="major"
        echo -e "${GREEN}✓ Version bump: major${NC}"
        ;;
    4)
        read -p "Nouvelle version (ex: 2.1.0): " CUSTOM_VERSION
        if [[ ! $CUSTOM_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo -e "${RED}❌ Format de version invalide${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Version custom: $CUSTOM_VERSION${NC}"
        ;;
    5)
        echo -e "${YELLOW}⚠️  Versions actuelles conservées${NC}"
        ;;
    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac

echo ""

# Bump versions if needed
if [[ -n $BUMP_TYPE ]] || [[ -n $CUSTOM_VERSION ]]; then
    echo "📦 Mise à jour des versions..."
    echo ""

    declare -A NEW_VERSIONS

    for pkg_name in "${!PACKAGES[@]}"; do
        pkg_path="${PACKAGES[$pkg_name]}"

        if [[ -n $CUSTOM_VERSION ]]; then
            new_version=$CUSTOM_VERSION
        else
            # Use npm version to bump
            cd "$pkg_path"
            new_version=$(npm version $BUMP_TYPE --no-git-tag-version 2>&1 | grep -oP 'v\K[0-9.]+')
            cd - > /dev/null
        fi

        NEW_VERSIONS[$pkg_name]=$new_version
        echo -e "  ${CYAN}$pkg_name${NC}: ${CURRENT_VERSIONS[$pkg_name]} → ${GREEN}$new_version${NC}"

        # Update version in package.json if custom
        if [[ -n $CUSTOM_VERSION ]]; then
            cd "$pkg_path"
            npm version $CUSTOM_VERSION --no-git-tag-version > /dev/null 2>&1
            cd - > /dev/null
        fi
    done

    echo ""

    # Update cross-package dependencies
    echo "🔗 Mise à jour des dépendances inter-packages..."

    # Update eva-colors dependency in eva-css
    if [[ -n ${NEW_VERSIONS["eva-colors"]} ]]; then
        eva_colors_version=${NEW_VERSIONS["eva-colors"]}
        cd packages/eva-css
        npm pkg set dependencies.eva-colors="^$eva_colors_version"
        echo -e "  ${GREEN}✓${NC} eva-css-fluid → eva-colors: ^$eva_colors_version"
        cd - > /dev/null
    fi

    echo ""
fi

# Build eva-css
echo "🔨 Build de eva-css-fluid..."
cd packages/eva-css
pnpm build &> /dev/null
pnpm build:min &> /dev/null
echo -e "${GREEN}✓ Build terminé${NC}"
cd ../..
echo ""

# Verify package contents
echo "📦 Vérification des packages..."
echo ""

for pkg_name in "${!PACKAGES[@]}"; do
    pkg_path="${PACKAGES[$pkg_name]}"
    echo "  $pkg_name:"
    cd "$pkg_path"
    npm pack --dry-run 2>&1 | grep "package size\|total files" | sed 's/npm notice /    /'
    cd - > /dev/null
done

echo ""

# Show summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 RÉSUMÉ DE LA PUBLICATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

for pkg_name in "${!PACKAGES[@]}"; do
    if [[ -n ${NEW_VERSIONS[$pkg_name]} ]]; then
        echo -e "  ${CYAN}$pkg_name${NC}: ${CURRENT_VERSIONS[$pkg_name]} → ${GREEN}${NEW_VERSIONS[$pkg_name]}${NC}"
    else
        echo -e "  ${CYAN}$pkg_name${NC}: ${YELLOW}${CURRENT_VERSIONS[$pkg_name]}${NC} (inchangé)"
    fi
done

echo ""
echo -e "${YELLOW}⚠️  Êtes-vous prêt à publier ces packages sur NPM ?${NC}"
echo "   Cette action est irréversible !"
echo ""
read -p "Taper 'yes' pour continuer: " -r
echo ""

if [[ ! $REPLY =~ ^yes$ ]]; then
    echo -e "${RED}❌ Publication annulée${NC}"

    # Revert version changes
    if [[ -n $BUMP_TYPE ]] || [[ -n $CUSTOM_VERSION ]]; then
        echo "🔄 Annulation des changements de version..."
        git checkout packages/*/package.json 2>/dev/null || true
    fi

    exit 1
fi

# Publish packages
echo "📤 Publication des packages..."
echo ""

PUBLISHED_COUNT=0
FAILED_COUNT=0

for pkg_name in "${!PACKAGES[@]}"; do
    pkg_path="${PACKAGES[$pkg_name]}"

    echo -e "  ${CYAN}Publishing $pkg_name...${NC}"
    cd "$pkg_path"

    if npm publish 2>&1; then
        echo -e "  ${GREEN}✓ $pkg_name publié${NC}"
        ((PUBLISHED_COUNT++))
    else
        echo -e "  ${RED}✗ Échec de publication de $pkg_name${NC}"
        ((FAILED_COUNT++))
    fi

    cd - > /dev/null
    echo ""
done

# Final summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [[ $FAILED_COUNT -eq 0 ]]; then
    echo -e "${GREEN}🎉 Tous les packages ont été publiés avec succès !${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Get the version to use for git tag
    TAG_VERSION=""
    if [[ -n $CUSTOM_VERSION ]]; then
        TAG_VERSION=$CUSTOM_VERSION
    elif [[ -n ${NEW_VERSIONS["eva-css-fluid"]} ]]; then
        TAG_VERSION=${NEW_VERSIONS["eva-css-fluid"]}
    else
        TAG_VERSION=${CURRENT_VERSIONS["eva-css-fluid"]}
    fi

    echo "📝 Prochaines étapes recommandées:"
    echo ""
    echo "  1. Commit des changements:"
    echo -e "     ${CYAN}git add packages/*/package.json${NC}"
    echo -e "     ${CYAN}git commit -m \"chore: bump versions to $TAG_VERSION\"${NC}"
    echo ""
    echo "  2. Créer un tag git:"
    echo -e "     ${CYAN}git tag v$TAG_VERSION${NC}"
    echo -e "     ${CYAN}git push origin main --tags${NC}"
    echo ""
    echo "  3. Vérifier sur NPM:"
    echo "     - https://www.npmjs.com/package/eva-colors"
    echo "     - https://www.npmjs.com/package/eva-css-fluid"
    echo "     - https://www.npmjs.com/package/eva-css-purge"
    echo "     - https://www.npmjs.com/package/create-eva-css"
    echo ""
else
    echo -e "${YELLOW}⚠️  Publication partielle${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${GREEN}Réussis: $PUBLISHED_COUNT${NC}"
    echo -e "  ${RED}Échecs: $FAILED_COUNT${NC}"
    echo ""
    echo "Veuillez vérifier les erreurs ci-dessus."
    echo ""
fi
