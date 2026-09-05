<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SaaS Application Framework</title>

    <!-- 1. Vite directive compiles and injects your Tailwind CSS and JavaScript modules -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <!-- @vite(['resources/js/app.js']) -->
</head>
<body class="antialiased bg-slate-50">

    <!-- 2. The critical anchor hook. Vue will replace this entire div with App.vue -->
    <div id="app"></div>

</body>
</html>
