function splitTextIntoLines(text, maxWidth, measureCharWidth, options) {
    const { charSpacing = 2 } = options || {};

    if (typeof text !== 'string') {
        throw new TypeError('text must be a string');
    }
    if (typeof maxWidth !== 'number' || maxWidth <= 0) {
        throw new TypeError('maxWidth must be a positive number');
    }
    if (typeof measureCharWidth !== 'function') {
        throw new TypeError('measureCharWidth must be a function');
    }

    const paragraphs = text.split('\n');
    const lines = [];

    for (const paragraph of paragraphs) {
        if (paragraph === '') {
            lines.push('');
            continue;
        }

        let currentLine = '';
        let currentWidth = 0;

        for (let i = 0; i < paragraph.length; i++) {
            const char = paragraph[i];
            const charWidth = measureCharWidth(char) + charSpacing;

            if (currentWidth + charWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = char;
                currentWidth = charWidth;
            } else {
                currentLine += char;
                currentWidth += charWidth;
            }
        }

        if (currentLine !== '') {
            lines.push(currentLine);
        }
    }

    return lines;
}

function calculatePages(text, pageConfig, measureCharWidth) {
    const {
        pageWidth = 800,
        pageHeight = 1150,
        padding = 60,
        lineHeight = 1.8,
        fontSize = 32,
        charSpacing = 2
    } = pageConfig || {};

    if (typeof text !== 'string') {
        throw new TypeError('text must be a string');
    }
    if (typeof pageWidth !== 'number' || pageWidth <= 0) {
        throw new TypeError('pageWidth must be a positive number');
    }
    if (typeof pageHeight !== 'number' || pageHeight <= 0) {
        throw new TypeError('pageHeight must be a positive number');
    }
    if (typeof padding !== 'number' || padding < 0) {
        throw new TypeError('padding must be a non-negative number');
    }
    if (typeof lineHeight !== 'number' || lineHeight <= 0) {
        throw new TypeError('lineHeight must be a positive number');
    }
    if (typeof fontSize !== 'number' || fontSize <= 0) {
        throw new TypeError('fontSize must be a positive number');
    }

    const contentWidth = pageWidth - padding * 2;
    const contentHeight = pageHeight - padding * 2;
    const lineHeightPx = fontSize * lineHeight;

    if (contentWidth <= 0) {
        throw new Error('pageWidth is too small for the given padding');
    }
    if (contentHeight <= 0) {
        throw new Error('pageHeight is too small for the given padding');
    }

    const lines = splitTextIntoLines(text, contentWidth, measureCharWidth, { charSpacing });
    const linesPerPage = Math.floor(contentHeight / lineHeightPx);

    if (linesPerPage <= 0) {
        throw new Error('pageHeight is too small to fit any lines');
    }

    const pages = [];
    for (let i = 0; i < lines.length; i += linesPerPage) {
        pages.push(lines.slice(i, i + linesPerPage));
    }

    if (pages.length === 0) {
        pages.push([]);
    }

    return pages;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        splitTextIntoLines,
        calculatePages
    };
}

if (typeof window !== 'undefined') {
    window.TextLayoutUtils = {
        splitTextIntoLines,
        calculatePages
    };
}
