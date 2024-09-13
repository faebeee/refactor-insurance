export default [{
    id: "test",
    url: "http://localhost:3000",
    viewport: [1080, 1024],
    pages: [
        {
            path: '/de',
            id: 'landingpage',
            /**
             * @param {import('puppeteer').Page} page
             * @returns {Promise<void>}
             */
            setup: async (page) => {
            }
        },
        {
            path: '/de/map-module/participant',
            id: 'participant-document-groups',
            /**
             * @param {import('puppeteer').Page} page
             * @returns {Promise<void>}
             */
            setup: async (page) => {
            }
        },
        {
            path: '/de/map-module/participant',
            id: 'participang-map-module',
            /**
             * @param {import('puppeteer').Page} page
             * @returns {Promise<void>}
             */
            setup: async (page) => {
            }
        }
    ]
}]