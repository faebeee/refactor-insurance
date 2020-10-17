# refactor-insurance

## Install

    npm i -g refactor-insurance
    
## Usage

### `generate`
Generate screenshots configured in the config file

    refactor generate [--config path/to/config.json] [--update] [--folder path/to/storage]
    
   
### `compare`

Compare generated screenshots with new ones
    
    refactor compare [--config path/to/config.json] [--folder path/to/storage] [--threshold 200]
   
    
    
## Config

Within the `auth` object, you can describe how the login should happen. This is useful for sites, which require
login or have a lockdown page. The `auth` object is optional.

In the `urls` you can pass a list of urls which should be compared

    [
        {
            "auth": {
                "url": "https://example.com/login",
                "steps": [
                    {
                        "selector": "[name='_username']",
                        "text": "foo@bar.io"
                    },
                    {
                        "selector": "[name='_password']",
                        "text": "123456789"
                    }
                ],
                "submit": "[name='_submit']"
            },
            "urls": [
                "https://example.com",
                "https://example.com/pages",
                "https://example.com/pages/2"
            ]
        }
    ]
