'use strict';

import foo from './lib/sr';
import nav from './lib/nav';

// loading中...
let loading = document.querySelector(".ui-loading")
window.onload = function () {
    loading.style.opacity = 0;
    setTimeout(() => {
        loading.parentElement.removeChild(loading);
    }, 750)
}

