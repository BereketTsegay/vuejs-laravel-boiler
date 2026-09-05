<?php

use Illuminate\Support\Facades\Route;

// Any web route request that does NOT match an /api route will fall through here
Route::get('{any}', function () {
    return view('app'); // Renders resources/views/app.blade.php
})->where('any', '.*'); // The '.*' regex captures every string, including slashes
