<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['slug', 'name'];

    /**
     * Map reverse association back down to profile rows.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
