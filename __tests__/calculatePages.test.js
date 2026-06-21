const { calculatePages } = require('../js/textLayoutUtils');

function createMockMeasure(charWidth = 10) {
    return jest.fn(() => charWidth);
}

describe('calculatePages', () => {
    describe('参数校验', () => {
        test('text不是字符串时抛出TypeError', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages(123, {}, measure)).toThrow(TypeError);
            expect(() => calculatePages(null, {}, measure)).toThrow(TypeError);
            expect(() => calculatePages(undefined, {}, measure)).toThrow(TypeError);
        });

        test('pageWidth无效时抛出错误', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages('test', { pageWidth: 0 }, measure)).toThrow(TypeError);
            expect(() => calculatePages('test', { pageWidth: -1 }, measure)).toThrow(TypeError);
        });

        test('pageHeight无效时抛出错误', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages('test', { pageHeight: 0 }, measure)).toThrow(TypeError);
            expect(() => calculatePages('test', { pageHeight: -1 }, measure)).toThrow(TypeError);
        });

        test('padding为负数时抛出错误', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages('test', { padding: -10 }, measure)).toThrow(TypeError);
        });

        test('lineHeight无效时抛出错误', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages('test', { lineHeight: 0 }, measure)).toThrow(TypeError);
            expect(() => calculatePages('test', { lineHeight: -1 }, measure)).toThrow(TypeError);
        });

        test('fontSize无效时抛出错误', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages('test', { fontSize: 0 }, measure)).toThrow(TypeError);
            expect(() => calculatePages('test', { fontSize: -1 }, measure)).toThrow(TypeError);
        });

        test('padding过大导致contentWidth为负时抛出错误', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages('test', { pageWidth: 100, padding: 60 }, measure)).toThrow('pageWidth is too small');
        });

        test('padding过大导致contentHeight为负时抛出错误', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages('test', { pageHeight: 100, padding: 60 }, measure)).toThrow('pageHeight is too small');
        });

        test('pageHeight太小无法容纳一行时抛出错误', () => {
            const measure = createMockMeasure();
            expect(() => calculatePages('test', {
                pageHeight: 100,
                padding: 10,
                fontSize: 50,
                lineHeight: 2
            }, measure)).toThrow('pageHeight is too small to fit any lines');
        });
    });

    describe('默认配置', () => {
        test('空文本返回包含一个带空行的空页', () => {
            const measure = createMockMeasure();
            const result = calculatePages('', {}, measure);
            expect(result).toEqual([['']]);
        });

        test('使用默认pageConfig值', () => {
            const measure = createMockMeasure(10);
            const result = calculatePages('test', undefined, measure);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('单页内容', () => {
        test('少量文本只占一页', () => {
            const measure = createMockMeasure(10);
            const config = {
                pageWidth: 800,
                pageHeight: 1150,
                padding: 60,
                fontSize: 32,
                lineHeight: 1.8,
                charSpacing: 2
            };
            const result = calculatePages('hello world', config, measure);
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(1);
            expect(result[0][0]).toBe('hello world');
        });

        test('恰好填满一页', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const config = {
                pageWidth: 140,
                pageHeight: 200,
                padding: 20,
                fontSize: 20,
                lineHeight: 2,
                charSpacing
            };

            const contentWidth = 140 - 2 * 20;
            const contentHeight = 200 - 2 * 20;
            const lineHeightPx = 20 * 2;
            const linesPerPage = Math.floor(contentHeight / lineHeightPx);
            const charsPerLine = Math.floor(contentWidth / (10 + charSpacing));

            const text = 'a'.repeat(charsPerLine * linesPerPage);
            const result = calculatePages(text, config, measure);

            expect(result.length).toBe(1);
            expect(result[0].length).toBe(linesPerPage);
            expect(result[0].every(line => line.length === charsPerLine)).toBe(true);
        });
    });

    describe('多页内容', () => {
        test('文本超过一页时正确分页', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const config = {
                pageWidth: 140,
                pageHeight: 200,
                padding: 20,
                fontSize: 20,
                lineHeight: 2,
                charSpacing
            };

            const contentWidth = 140 - 2 * 20;
            const contentHeight = 200 - 2 * 20;
            const lineHeightPx = 20 * 2;
            const linesPerPage = Math.floor(contentHeight / lineHeightPx);
            const charsPerLine = Math.floor(contentWidth / (10 + charSpacing));

            const text = 'a'.repeat(charsPerLine * linesPerPage * 3);
            const result = calculatePages(text, config, measure);

            expect(result.length).toBe(3);
            expect(result[0].length).toBe(linesPerPage);
            expect(result[1].length).toBe(linesPerPage);
            expect(result[2].length).toBe(linesPerPage);
        });

        test('最后一页不足时正确填充', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const config = {
                pageWidth: 140,
                pageHeight: 200,
                padding: 20,
                fontSize: 20,
                lineHeight: 2,
                charSpacing
            };

            const contentWidth = 140 - 2 * 20;
            const contentHeight = 200 - 2 * 20;
            const lineHeightPx = 20 * 2;
            const linesPerPage = Math.floor(contentHeight / lineHeightPx);
            const charsPerLine = Math.floor(contentWidth / (10 + charSpacing));

            const extraChars = 5;
            const text = 'a'.repeat(charsPerLine * linesPerPage * 2 + extraChars);
            const result = calculatePages(text, config, measure);

            expect(result.length).toBe(3);
            expect(result[0].length).toBe(linesPerPage);
            expect(result[1].length).toBe(linesPerPage);
            expect(result[2].length).toBe(1);
            expect(result[2][0].length).toBe(extraChars);
        });
    });

    describe('换行符分页', () => {
        test('包含换行符的文本正确分页', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const config = {
                pageWidth: 200,
                pageHeight: 200,
                padding: 20,
                fontSize: 20,
                lineHeight: 2,
                charSpacing
            };

            const linesPerPage = 4;
            const lines = Array(linesPerPage * 2 + 1).fill('test').join('\n');
            const result = calculatePages(lines, config, measure);

            expect(result.length).toBe(3);
            expect(result[0].length).toBe(linesPerPage);
            expect(result[1].length).toBe(linesPerPage);
            expect(result[2].length).toBe(1);
        });

        test('空行也计入行数', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const config = {
                pageWidth: 200,
                pageHeight: 200,
                padding: 20,
                fontSize: 20,
                lineHeight: 2,
                charSpacing
            };

            const linesPerPage = 4;
            const lines = '\n\n\n\n\n';
            const result = calculatePages(lines, config, measure);

            expect(result.length).toBe(2);
            expect(result[0].length).toBe(linesPerPage);
            expect(result[1].length).toBe(2);
            expect(result[0].every(line => line === '')).toBe(true);
        });
    });

    describe('配置参数影响', () => {
        test('pageWidth影响每行字符数', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const baseConfig = {
                pageHeight: 500,
                padding: 0,
                fontSize: 20,
                lineHeight: 1,
                charSpacing
            };

            const narrowResult = calculatePages('aaaaaaaaaa', { ...baseConfig, pageWidth: 40 }, measure);
            const wideResult = calculatePages('aaaaaaaaaa', { ...baseConfig, pageWidth: 100 }, measure);

            expect(narrowResult[0].length).toBe(3);
            expect(wideResult[0].length).toBe(1);
        });

        test('padding影响可用区域', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const baseConfig = {
                pageWidth: 200,
                pageHeight: 500,
                fontSize: 20,
                lineHeight: 1,
                charSpacing
            };

            const smallPadding = calculatePages('aaaaaaaaaaaaaaaaaaaa', { ...baseConfig, padding: 10 }, measure);
            const largePadding = calculatePages('aaaaaaaaaaaaaaaaaaaa', { ...baseConfig, padding: 50 }, measure);

            expect(smallPadding[0][0].length).toBeGreaterThan(largePadding[0][0].length);
        });

        test('fontSize和lineHeight影响每页行数', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const baseConfig = {
                pageWidth: 500,
                pageHeight: 200,
                padding: 0,
                charSpacing
            };

            const text = 'a\n'.repeat(20).trim();

            const smallFont = calculatePages(text, { ...baseConfig, fontSize: 10, lineHeight: 1 }, measure);
            const largeFont = calculatePages(text, { ...baseConfig, fontSize: 40, lineHeight: 2 }, measure);

            expect(smallFont.length).toBeLessThan(largeFont.length);
        });
    });

    describe('边缘情况', () => {
        test('单字符多页', () => {
            const measure = createMockMeasure(10);
            const config = {
                pageWidth: 30,
                pageHeight: 50,
                padding: 0,
                fontSize: 20,
                lineHeight: 2,
                charSpacing: 0
            };

            const result = calculatePages('aaaaaa', config, measure);
            expect(result.length).toBeGreaterThan(1);
        });

        test('大量内容时分页正确', () => {
            const measure = createMockMeasure(1);
            const config = {
                pageWidth: 120,
                pageHeight: 120,
                padding: 10,
                fontSize: 10,
                lineHeight: 2,
                charSpacing: 0
            };

            const contentWidth = 100;
            const contentHeight = 100;
            const lineHeightPx = 20;
            const linesPerPage = Math.floor(contentHeight / lineHeightPx);
            const charsPerLine = Math.floor(contentWidth);

            const totalPages = 10;
            const text = 'a'.repeat(charsPerLine * linesPerPage * totalPages);
            const result = calculatePages(text, config, measure);

            expect(result.length).toBe(totalPages);
            result.forEach(page => {
                expect(page.length).toBeLessThanOrEqual(linesPerPage);
            });
        });
    });
});
