# refactor-insurance

Often during refactoring, stuff breaks and is undetected until production. With `refactor-insurance` you
can configure some urls which will be screenshotted. After you've completed your refactoring, rerun the tool to compare
the screenshots you've taken before your refactor and compare them with a newly created screenshot. If the images do not 
match, you can investigate further. 

## Install

    npm i -g refactor-insurance
    
## Usage

### `generate`
Generate screenshots configured in the config file

    refactor generate ./localhost.js
    
   
### `compare`

Compare generated screenshots with new ones
    
    refactor compare ./localhost.js
    
    
## Config

Within the `auth` object, you can describe how the login should happen. This is useful for sites, which require
login or have a lockdown page. The `auth` object is optional.

In the `urls` you can pass a list of urls which should be compared

__localhost.js__

```javascript
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
```
