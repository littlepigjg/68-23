/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.spec.js'
    ],
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/main.js',
        '!js/eventHandlers.js',
        '!js/exportHandlers.js'
    ],
    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],
    coverageDirectory: 'coverage',
    verbose: true
};
