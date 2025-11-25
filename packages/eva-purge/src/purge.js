
/**
 * CSS Purge Script for EvaCSS - FIXED VERSION
 *
 * FIX: Use config.content patterns instead of hardcoded patterns that ignore dist/
 * This allows scanning of built files in docs/.vuepress/dist/
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CSSPurger {
    constructor(config = {}) {
        this.config = {
            content: config.content || ['**/*.{html,js}'],
            css: config.css || 'styles/main.css',
            output: config.output || 'styles/main-compressed.css',
            safelist: config.safelist || [],
            ...config
        };
        this.usedClasses = new Set();
        this.usedVariables = new Set();
        this.usedIds = new Set();
        this.cssContent = '';
        this.compressedCSS = '';
    }

    /**
     * Main purge process
     */
    async purge() {
        console.log('🚀 Starting CSS purge process...');

        try {
            // Step 1: Analyze content files using config patterns - FIXED
            await this.analyzeContentFiles();

            // Step 2: Read compiled CSS
            await this.readCompiledCSS();

            // Step 3: Extract used styles
            await this.extractUsedStyles();

            // Step 4: Compress and optimize
            await this.compressCSS();

            // Step 5: Write output
            await this.writeCompressedCSS();

            console.log('✅ CSS purge completed successfully!');
            this.showStats();

        } catch (error) {
            console.error('❌ Error during CSS purge:', error);
            process.exit(1);
        }
    }

    /**
     * Analyze content files using config patterns - FIXED
     * This now uses config.content instead of hardcoded patterns
     */
    async analyzeContentFiles() {
        console.log('📄 Analyzing content files...');

        const allFiles = new Set();

        // Use config.content patterns instead of hardcoded patterns - THIS IS THE FIX
        for (const pattern of this.config.content) {
            const files = glob.sync(pattern, {
                ignore: ['node_modules/**'],  // Only ignore node_modules, NOT dist/
                nodir: true
            });
            files.forEach(file => allFiles.add(file));
        }

        console.log(`📁 Found ${allFiles.size} files to analyze`);

        for (const file of allFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                this.extractFromContent(content, file);
            } catch (error) {
                console.warn(`⚠️  Could not read file: ${file}`);
            }
        }

        console.log(`📊 Found ${this.usedClasses.size} unique classes`);
        console.log(`📊 Found ${this.usedIds.size} unique IDs`);
        console.log(`📊 Found ${this.usedVariables.size} CSS variables`);
    }

    /**
     * Extract classes, IDs and variables from content
     */
    extractFromContent(content, filename) {
        // Extract classes from class attributes
        const classMatches = content.match(/class=["']([^"']+)["']/g);
        if (classMatches) {
            classMatches.forEach(match => {
                const classes = match.replace(/class=["']([^"']+)["']/, '$1').split(/\s+/);
                classes.forEach(cls => {
                    if (cls.trim()) {
                        this.usedClasses.add(cls.trim());
                    }
                });
            });
        }

        // Extract IDs from id attributes
        const idMatches = content.match(/id=["']([^"']+)["']/g);
        if (idMatches) {
            idMatches.forEach(match => {
                const id = match.replace(/id=["']([^"']+)["']/, '$1').trim();
                if (id) {
                    this.usedIds.add(id);
                }
            });
        }

        // Extract CSS variables
        const varMatches = content.match(/var\(--[^)]+\)/g);
        if (varMatches) {
            varMatches.forEach(match => {
                const varName = match.replace(/var\((--[^)]+)\)/, '$1');
                this.usedVariables.add(varName);
            });
        }

        // Extract classes from classList methods (JS)
        const classListMatches = content.match(/classList\.(add|remove|toggle|contains)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
        if (classListMatches) {
            classListMatches.forEach(match => {
                const className = match.replace(/.*['"`]([^'"`]+)['"`].*/, '$1');
                if (className) {
                    this.usedClasses.add(className);
                }
            });
        }

        // Extract classes from className assignments (JS)
        const classNameMatches = content.match(/\.className\s*=\s*['"`]([^'"`]+)['"`]/g);
        if (classNameMatches) {
            classNameMatches.forEach(match => {
                const classes = match.replace(/.*['"`]([^'"`]+)['"`].*/, '$1').split(/\s+/);
                classes.forEach(cls => {
                    if (cls.trim()) {
                        this.usedClasses.add(cls.trim());
                    }
                });
            });
        }

        // Extract from querySelector/querySelectorAll
        const querySelectorMatches = content.match(/querySelector(?:All)?\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
        if (querySelectorMatches) {
            querySelectorMatches.forEach(match => {
                const selector = match.replace(/.*['"`]([^'"`]+)['"`].*/, '$1');

                // Extract class names
                const selectorClassMatches = selector.match(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g);
                if (selectorClassMatches) {
                    selectorClassMatches.forEach(cls => {
                        this.usedClasses.add(cls.substring(1));
                    });
                }

                // Extract IDs
                const selectorIdMatches = selector.match(/#([a-zA-Z_-][a-zA-Z0-9_-]*)/g);
                if (selectorIdMatches) {
                    selectorIdMatches.forEach(id => {
                        this.usedIds.add(id.substring(1));
                    });
                }
            });
        }

        // Extract from getElementById
        const getElementByIdMatches = content.match(/getElementById\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
        if (getElementByIdMatches) {
            getElementByIdMatches.forEach(match => {
                const id = match.replace(/.*['"`]([^'"`]+)['"`].*/, '$1');
                if (id) {
                    this.usedIds.add(id);
                }
            });
        }

        // Extract CSS variables from setProperty calls
        const setPropMatches = content.match(/setProperty\s*\(\s*['"`](--[^'"`]+)['"`]/g);
        if (setPropMatches) {
            setPropMatches.forEach(match => {
                const varName = match.replace(/.*['"`](--[^'"`]+)['"`].*/, '$1');
                this.usedVariables.add(varName);
            });
        }

        // Extract CSS variables from getPropertyValue calls
        const getPropMatches = content.match(/getPropertyValue\s*\(\s*['"`](--[^'"`]+)['"`]/g);
        if (getPropMatches) {
            getPropMatches.forEach(match => {
                const varName = match.replace(/.*['"`](--[^'"`]+)['"`].*/, '$1');
                this.usedVariables.add(varName);
            });
        }
    }

    /**
     * Read the compiled CSS file
     */
    async readCompiledCSS() {
        console.log('📖 Reading compiled CSS...');

        const cssPath = path.resolve(process.cwd(), this.config.css);

        if (!fs.existsSync(cssPath)) {
            throw new Error(`CSS file not found: ${cssPath}`);
        }

        this.cssContent = fs.readFileSync(cssPath, 'utf8');
        console.log(`📊 Original CSS size: ${(this.cssContent.length / 1024).toFixed(2)} KB`);
    }

    /**
     * Extract only the used CSS rules and variables
     */
    async extractUsedStyles() {
        console.log('🔍 Extracting used styles...');

        const lines = this.cssContent.split('\n');
        const usedLines = [];
        let currentRule = '';
        let currentRuleContent = '';
        let inRule = false;
        let inRootRule = false;
        let inMediaQuery = false;
        let braceCount = 0;
        let ruleLines = [];
        let processedRules = 0;
        let mediaQueryCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            if (i % 1000 === 0) {
                console.log(`📊 Processing line ${i}/${lines.length} (${Math.round(i/lines.length*100)}%)`);
            }

            if (!trimmedLine || (trimmedLine.startsWith('/*') && !inRule)) {
                continue;
            }

            if (!inRule && !trimmedLine.includes('{') && !trimmedLine.includes('}') &&
                (trimmedLine.includes(',') || /^[a-zA-Z*#.\[]/.test(trimmedLine) || trimmedLine.includes('::') || trimmedLine.includes(':'))) {
                if (!currentRule) {
                    currentRule = trimmedLine;
                    ruleLines = [line];
                } else {
                    currentRule += ',' + trimmedLine;
                    ruleLines.push(line);
                }
                continue;
            }

            if (trimmedLine.includes('{')) {
                braceCount++;
                if (!inRule && braceCount === 1) {
                    if (!currentRule) {
                        currentRule = trimmedLine.replace(/\s*\{.*/, '');
                        ruleLines = [line];
                    } else {
                        currentRule += trimmedLine.replace(/\s*\{.*/, '');
                        ruleLines.push(line);
                    }
                    currentRuleContent = '';
                    inRule = true;

                    if (currentRule.includes('@media')) {
                        inMediaQuery = true;
                        mediaQueryCount++;
                        console.log(`📱 Found media query: ${currentRule.trim()} - keeping completely`);
                    } else if (currentRule.includes(':root') || currentRule.includes('.all-grads')) {
                        inRootRule = true;
                        console.log(`📋 Found ${currentRule.trim()} block - keeping all variables`);
                    }
                } else if (inRule) {
                    ruleLines.push(line);
                }
            } else if (trimmedLine.includes('}')) {
                braceCount--;
                if (inRule) {
                    ruleLines.push(line);

                    if (braceCount === 0) {
                        processedRules++;

                        const shouldKeep = inMediaQuery ||
                                          inRootRule ||
                                          this.isUsedSelector(currentRule) ||
                                          this.hasCurrentVariables(currentRuleContent);

                        if (shouldKeep) {
                            usedLines.push(...ruleLines);
                            if (inRootRule) {
                                const varCount = ruleLines.join('').match(/--[a-zA-Z][a-zA-Z0-9_-]*:/g)?.length || 0;
                                console.log(`📋 Kept ${varCount} CSS variables from ${currentRule.trim()}`);
                            }
                        }

                        inRule = false;
                        inRootRule = false;
                        inMediaQuery = false;
                        currentRule = '';
                        currentRuleContent = '';
                        ruleLines = [];
                    }
                }
            } else if (inRule) {
                ruleLines.push(line);
                currentRuleContent += ' ' + trimmedLine;
            }
        }

        console.log(`📊 Processed ${processedRules} CSS rules`);
        console.log(`📱 Kept ${mediaQueryCount} media queries`);
        this.compressedCSS = usedLines.join('\n');
        console.log(`📊 Extracted CSS size: ${(this.compressedCSS.length / 1024).toFixed(2)} KB`);
    }

    /**
     * Check if a CSS rule uses --current- variables and should be kept
     */
    hasCurrentVariables(ruleContent) {
        return /var\(--current-/.test(ruleContent);
    }

    /**
     * Check if a CSS selector is an HTML element or reset selector that should be kept
     */
    isElementOrResetSelector(selector) {
        const cleanSelector = selector.replace(/\s*\{.*/, '').trim();

        if (cleanSelector.includes('*') ||
            cleanSelector.includes('::before') ||
            cleanSelector.includes('::after') ||
            cleanSelector.includes(':target') ||
            /^body[,\s]|^html[,\s]/.test(cleanSelector)) {
            return true;
        }

        const selectors = cleanSelector.split(',');

        const htmlElements = [
            'html', 'body', 'head', 'title', 'meta', 'link', 'script', 'style',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
            'a', 'img', 'figure', 'figcaption', 'picture', 'source',
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
            'form', 'input', 'button', 'textarea', 'select', 'option', 'label', 'fieldset', 'legend',
            'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main',
            'blockquote', 'cite', 'q', 'pre', 'code', 'kbd', 'samp', 'var',
            'em', 'strong', 'b', 'i', 'u', 's', 'small', 'mark', 'del', 'ins', 'sub', 'sup',
            'video', 'audio', 'canvas', 'svg', 'iframe', 'embed', 'object', 'param'
        ];

        for (const sel of selectors) {
            const trimmedSel = sel.trim();

            const baseElement = trimmedSel.replace(/::[^,\s]+|:[^,\s(]+(\([^)]*\))?/g, '').trim();
            if (htmlElements.includes(baseElement)) {
                return true;
            }

            if (htmlElements.some(element => trimmedSel.startsWith(element + ':') || trimmedSel.startsWith(element + '::') || trimmedSel === element)) {
                return true;
            }

            if (htmlElements.some(element => trimmedSel.startsWith(element + '[') && trimmedSel.includes(']'))) {
                return true;
            }

            const match = trimmedSel.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
            if (match && htmlElements.includes(match[1])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a CSS selector is used in the HTML or JavaScript
     */
    isUsedSelector(selector) {
        const cleanSelector = selector.replace(/\s*\{.*/, '').trim();

        if (this.isElementOrResetSelector(selector)) {
            return true;
        }

        const selectors = cleanSelector.split(',');

        for (const sel of selectors) {
            const trimmedSel = sel.trim();

            if (trimmedSel.includes('::') || trimmedSel.includes(':hover') || trimmedSel.includes(':before') || trimmedSel.includes(':after')) {
                const baseSelector = trimmedSel.replace(/::[^,\s]+|:[^,\s]+/g, '').trim();
                if (this.isUsedSelector(baseSelector)) {
                    return true;
                }
                continue;
            }

            if (trimmedSel.startsWith('#')) {
                const idName = trimmedSel.substring(1).replace(/[^\w-_]/g, '');
                if (this.usedIds.has(idName)) {
                    return true;
                }
            }

            if (trimmedSel.startsWith('.')) {
                const className = trimmedSel.substring(1).replace(/[^\w-_]/g, '');
                if (this.usedClasses.has(className)) {
                    return true;
                }
            }

            const classes = trimmedSel.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g);
            const ids = trimmedSel.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g);

            if (classes || ids) {
                let allSelectorsUsed = true;

                if (classes) {
                    allSelectorsUsed = allSelectorsUsed && classes.every(cls => {
                        const className = cls.substring(1);
                        return this.usedClasses.has(className);
                    });
                }

                if (ids) {
                    allSelectorsUsed = allSelectorsUsed && ids.every(id => {
                        const idName = id.substring(1);
                        return this.usedIds.has(idName);
                    });
                }

                if (allSelectorsUsed && (classes?.length > 0 || ids?.length > 0)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Compress and optimize the CSS
     */
    async compressCSS() {
        console.log('🗜️  Compressing CSS...');

        let compressed = this.compressedCSS;

        compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, '');
        compressed = compressed.replace(/\s+/g, ' ');
        compressed = compressed.replace(/\s*{\s*/g, '{');
        compressed = compressed.replace(/\s*}\s*/g, '}');
        compressed = compressed.replace(/\s*;\s*/g, ';');
        compressed = compressed.replace(/\s*:\s*/g, ':');
        compressed = compressed.replace(/(\w|[)\]])\s*,\s*(\w|[.#*:])/g, '$1,$2');
        compressed = compressed.replace(/;}/g, '}');
        compressed = compressed.replace(/[^}]+{\s*}/g, '');
        compressed = compressed.trim();

        this.compressedCSS = compressed;
        console.log(`📊 Compressed CSS size: ${(compressed.length / 1024).toFixed(2)} KB`);
    }

    /**
     * Write the compressed CSS to file
     */
    async writeCompressedCSS() {
        console.log('💾 Writing compressed CSS...');

        const outputPath = path.resolve(process.cwd(), this.config.output);

        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const header = `/* EVA CSS Purged - Generated on ${new Date().toISOString()} */\n`;
        const finalCSS = header + this.compressedCSS;

        fs.writeFileSync(outputPath, finalCSS);
        console.log(`📁 Compressed CSS saved to: ${outputPath}`);
    }

    /**
     * Show compression statistics
     */
    showStats() {
        const originalSize = this.cssContent.length;
        const compressedSize = this.compressedCSS.length;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

        console.log('\n📊 Compression Statistics:');
        console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
        console.log(`   Space saved: ${savings}%`);
        console.log(`   Used classes: ${this.usedClasses.size}`);
        console.log(`   Used variables: ${this.usedVariables.size}`);
        console.log(`   Used IDs: ${this.usedIds.size}`);
    }
}

// Run the purger
if (require.main === module) {
    const purger = new CSSPurger();
    purger.purge();
}

module.exports = CSSPurger;
