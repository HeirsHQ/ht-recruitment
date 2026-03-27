const REDOC_TEMPLATE = `
<!doctype html>
<html>

<head>
    <title>i-Academy Portal API Documentation</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css?family=Manrope:300,400,700|Roboto:300,400,700" rel="stylesheet" />
    <style>
        body {
            margin: 0;
            padding: 0;
        }
    </style>
</head>

<body>
    <redoc spec-url="{{specUrl}}" sort-tags-alphabetically="true"></redoc>


    <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0-rc.75/bundles/redoc.standalone.js"></script>
</body>

</html>`;
export default REDOC_TEMPLATE;
