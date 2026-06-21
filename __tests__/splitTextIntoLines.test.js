const { splitTextIntoLines } = require('../js/textLayoutUtils');

function createMockMeasure(charWidth = 10) {
    return jest.fn(() => charWidth);
}

describe('splitTextIntoLines', () => {
    describe('参数校验', () => {
        test('text不是字符串时抛出TypeError', () => {
            const measure = createMockMeasure();
            expect(() => splitTextIntoLines(123, 100, measure)).toThrow(TypeError);
            expect(() => splitTextIntoLines(null, 100, measure)).toThrow(TypeError);
            expect(() => splitTextIntoLines(undefined, 100, measure)).toThrow(TypeError);
            expect(() => splitTextIntoLines([], 100, measure)).toThrow(TypeError);
        });

        test('maxWidth不是正数时抛出TypeError', () => {
            const measure = createMockMeasure();
            expect(() => splitTextIntoLines('test', 0, measure)).toThrow(TypeError);
            expect(() => splitTextIntoLines('test', -1, measure)).toThrow(TypeError);
            expect(() => splitTextIntoLines('test', '100', measure)).toThrow(TypeError);
        });

        test('measureCharWidth不是函数时抛出TypeError', () => {
            expect(() => splitTextIntoLines('test', 100, null)).toThrow(TypeError);
            expect(() => splitTextIntoLines('test', 100, {})).toThrow(TypeError);
            expect(() => splitTextIntoLines('test', 100, 'function')).toThrow(TypeError);
        });
    });

    describe('基本功能', () => {
        test('空字符串返回空数组', () => {
            const measure = createMockMeasure();
            const result = splitTextIntoLines('', 100, measure);
            expect(result).toEqual(['']);
        });

        test('单行文本在宽度足够时不换行', () => {
            const measure = createMockMeasure(10);
            const result = splitTextIntoLines('abcde', 100, measure);
            expect(result).toEqual(['abcde']);
        });

        test('文本恰好等于最大宽度时不换行', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 2;
            const maxWidth = 5 * (10 + charSpacing);
            const result = splitTextIntoLines('abcde', maxWidth, measure, { charSpacing });
            expect(result).toEqual(['abcde']);
        });

        test('文本超过最大宽度时正确换行', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const maxWidth = 30;
            const result = splitTextIntoLines('abcdefg', maxWidth, measure, { charSpacing });
            expect(result).toEqual(['abc', 'def', 'g']);
        });

        test('单个字符超过最大宽度时单独成行', () => {
            const measure = createMockMeasure(100);
            const result = splitTextIntoLines('ab', 50, measure, { charSpacing: 0 });
            expect(result).toEqual(['a', 'b']);
        });
    });

    describe('换行符处理', () => {
        test('单个换行符产生空行', () => {
            const measure = createMockMeasure();
            const result = splitTextIntoLines('\n', 100, measure);
            expect(result).toEqual(['', '']);
        });

        test('多个连续换行符产生多个空行', () => {
            const measure = createMockMeasure();
            const result = splitTextIntoLines('\n\n\n', 100, measure);
            expect(result).toEqual(['', '', '', '']);
        });

        test('文本中混合换行符正确分段', () => {
            const measure = createMockMeasure(10);
            const result = splitTextIntoLines('第一段\n第二段\n第三段', 200, measure);
            expect(result).toEqual(['第一段', '第二段', '第三段']);
        });

        test('换行后内容继续在新行换行', () => {
            const measure = createMockMeasure(10);
            const charSpacing = 0;
            const result = splitTextIntoLines('abcd\nefgh', 30, measure, { charSpacing });
            expect(result).toEqual(['abc', 'd', 'efg', 'h']);
        });

        test('文本开头和结尾的换行符被保留', () => {
            const measure = createMockMeasure();
            const result = splitTextIntoLines('\nhello\n', 100, measure);
            expect(result).toEqual(['', 'hello', '']);
        });
    });

    describe('字符间距', () => {
        test('charSpacing影响换行计算', () => {
            const measure = createMockMeasure(10);
            const maxWidth = 40;

            const resultNoSpacing = splitTextIntoLines('abcdefgh', maxWidth, measure, { charSpacing: 0 });
            const resultWithSpacing = splitTextIntoLines('abcdefgh', maxWidth, measure, { charSpacing: 2 });

            expect(resultNoSpacing).toEqual(['abcd', 'efgh']);
            expect(resultWithSpacing).toEqual(['abc', 'def', 'gh']);
        });

        test('默认charSpacing为2', () => {
            const measure = createMockMeasure(10);
            const maxWidth = 36;

            const resultDefault = splitTextIntoLines('abc', maxWidth, measure);
            const resultExplicit = splitTextIntoLines('abc', maxWidth, measure, { charSpacing: 2 });

            expect(resultDefault).toEqual(resultExplicit);
            expect(resultDefault).toEqual(['abc']);
        });

        test('负charSpacing允许更多字符', () => {
            const measure = createMockMeasure(10);
            const maxWidth = 30;

            const resultNormal = splitTextIntoLines('abcd', maxWidth, measure, { charSpacing: 2 });
            const resultNegative = splitTextIntoLines('abcd', maxWidth, measure, { charSpacing: -2 });

            expect(resultNormal).toEqual(['ab', 'cd']);
            expect(resultNegative).toEqual(['abc', 'd']);
        });
    });

    describe('measureCharWidth调用', () => {
        test('每个字符都调用measureCharWidth', () => {
            const measure = createMockMeasure(10);
            splitTextIntoLines('hello', 100, measure, { charSpacing: 0 });
            expect(measure).toHaveBeenCalledTimes(5);
        });

        test('measureCharWidth接收正确的参数', () => {
            const measure = createMockMeasure(10);
            splitTextIntoLines('abc', 100, measure, { charSpacing: 0 });
            expect(measure).toHaveBeenNthCalledWith(1, 'a');
            expect(measure).toHaveBeenNthCalledWith(2, 'b');
            expect(measure).toHaveBeenNthCalledWith(3, 'c');
        });

        test('不同字符宽度时正确换行', () => {
            const measure = jest.fn((char) => {
                if (char === 'W') return 20;
                if (char === 'i') return 5;
                return 10;
            });
            const charSpacing = 0;
            const maxWidth = 25;

            const result = splitTextIntoLines('WiWiWi', maxWidth, measure, { charSpacing });
            expect(result).toEqual(['Wi', 'Wi', 'Wi']);
        });
    });

    describe('边界情况', () => {
        test('单个字符返回单行', () => {
            const measure = createMockMeasure();
            const result = splitTextIntoLines('a', 100, measure);
            expect(result).toEqual(['a']);
        });

        test('仅包含空格的文本', () => {
            const measure = createMockMeasure(10);
            const result = splitTextIntoLines('     ', 100, measure);
            expect(result).toEqual(['     ']);
        });

        test('大量字符时性能正确', () => {
            const measure = createMockMeasure(1);
            const longText = 'a'.repeat(1000);
            const result = splitTextIntoLines(longText, 10, measure, { charSpacing: 0 });
            expect(result.length).toBe(100);
            expect(result.every(line => line.length <= 10)).toBe(true);
        });

        test('Unicode字符正确处理', () => {
            const measure = createMockMeasure(10);
            const result = splitTextIntoLines('你好世界', 25, measure, { charSpacing: 0 });
            expect(result).toEqual(['你好', '世界']);
        });

        test('emoji字符按UTF-16代码单元处理', () => {
            const measure = createMockMeasure(10);
            const result = splitTextIntoLines('😀😁', 25, measure, { charSpacing: 0 });
            expect(result.length).toBeGreaterThanOrEqual(1);
        });
    });
});
