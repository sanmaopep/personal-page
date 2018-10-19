(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// 上下Nav移动
function storyState() {
    var _this = this;

    this._touchHandler = this._touchHandler.bind(this);
    this._mouseWheel = this._mouseWheel.bind(this);
    this._triggerMobileNav = this._triggerMobileNav.bind(this);
    this._untriggerMobileNav = this._untriggerMobileNav.bind(this);

    this.storyOutterDOM = document.querySelector(".ui-content-story-outter");
    this.uiNavItems = document.querySelectorAll(".ui-nav-container li");

    // story全部不可见
    this.stories = this.storyOutterDOM.children;
    this.storiesLen = this.stories.length;

    for (var i = 0; i < this.storiesLen; i++) {
        this.stories[i].style.visibility = "hidden";
        this.stories[i].style.display = "none";
        this.stories[i].style.opacity = "0";
        this.stories[i].style.position = "relative";
        this.stories[i].style.left = "-30px";
        // 自己在CSS中添加transition属性
    }

    this.curr = 0;
    this._setCurrIndex(0);

    // 初始化左部导航
    if (this.uiNavItems) {
        (function () {
            var len = _this.uiNavItems.length;
            var selector = _this.uiNavItems[0];

            // 初始化
            selector.style.top = _this.uiNavItems[_this.curr + 1].offsetTop - 6 + "px";

            var _loop = function _loop(_i) {
                // 添加事件侦听
                _this.uiNavItems[_i].addEventListener('mouseover', function () {
                    selector.style.top = _this.uiNavItems[_i].offsetTop - 6 + "px";
                });

                _this.uiNavItems[_i].addEventListener('mouseout', function () {
                    if (_this.setCurrIndexBlock) {
                        return;
                    }
                    selector.style.top = _this.uiNavItems[_this.curr + 1].offsetTop - 6 + "px";
                });

                _this.uiNavItems[_i].addEventListener('click', function () {
                    _this._setCurrIndex(_i - 1);
                    _this._untriggerMobileNav();
                });
            };

            for (var _i = 1; _i < len; _i++) {
                _loop(_i);
            }
        })();
    }

    // 滚轮事件

    this.storyOutterDOM.addEventListener('mousewheel', this._mouseWheel);
    document.addEventListener('mousewheel', this._mouseWheel);

    // 移动端Nav
    this.trigger = false;

    document.querySelector(".ui-mobile-nav-trigger").addEventListener("click", this._triggerMobileNav);
    document.querySelector(".ui-nav-container").addEventListener("click", function (event) {
        event.stopPropagation();
    });
    document.body.addEventListener("click", this._untriggerMobileNav);

    // 移动端touch事件

    var contentArticle = document.querySelector(".ui-content-article");
    contentArticle.addEventListener('touchstart', this._touchHandler);
    contentArticle.addEventListener('touchend', this._touchHandler);
    contentArticle.addEventListener('touchmove', this._touchHandler);
}

// 移动端touch事件处理
storyState.prototype._touchHandler = function (event) {
    var touchY = void 0,
        touchX = void 0,
        deltaX = void 0,
        deltaY = void 0;

    var navContainer = document.querySelector(".ui-nav-container");
    switch (event.type) {
        case "touchend":
            // 左右划出
            deltaX = this.endTouchX - this.startTouchX;
            if (deltaX > 100 && !this.trigger) {
                navContainer.classList.add("ui-mobile-show");
                this.trigger = true;
                break;
            } else if (deltaX < -100 && this.trigger) {
                navContainer.classList.remove("ui-mobile-show");
                this.trigger = false;
                break;
            }
            // 上下翻页判断
            deltaY = this.endTouchY - this.startTouchY;
            if (deltaY > 50) {
                if (this.storyOutterDOM.scrollTop === 0) {
                    this._upStory();
                }
            } else if (deltaY < -50) {
                var scrollTop = this.storyOutterDOM.scrollTop;
                var offsetHeight = this.storyOutterDOM.offsetHeight;
                var scrollHeight = this.storyOutterDOM.scrollHeight;

                if (scrollTop + offsetHeight >= scrollHeight) {
                    this._downStory();
                }
            }

            break;

        case "touchstart":
            touchX = event.touches[0].clientX;
            touchY = event.touches[0].clientY;
            this.startTouchX = touchX;
            this.startTouchY = touchY;
            break;

        case "touchmove":
            touchX = event.touches[0].clientX;
            touchY = event.touches[0].clientY;
            this.endTouchX = touchX;
            this.endTouchY = touchY;
            break;
    }
};

// 移动端显示Nav
storyState.prototype._triggerMobileNav = function (event) {
    event.stopPropagation();
    var navContainer = document.querySelector(".ui-nav-container");
    if (this.trigger) {
        navContainer.classList.remove("ui-mobile-show");
        this.trigger = false;
    } else {
        navContainer.classList.add("ui-mobile-show");
        this.trigger = true;
    }
};

storyState.prototype._untriggerMobileNav = function (event) {
    var navContainer = document.querySelector(".ui-nav-container");
    if (this.trigger) {
        navContainer.classList.remove("ui-mobile-show");
        this.trigger = false;
    }
};

// 鼠标滚动事件
storyState.prototype._mouseWheel = function (event) {
    var _this2 = this;

    event.preventDefault();
    event.stopPropagation();
    var flag = 5;
    var ratio = 5;
    var animation = setInterval(function () {
        _this2.storyOutterDOM.scrollTop += event.deltaY > 0 ? ratio * flag : -ratio * flag;
        if (flag-- <= 0) {
            clearInterval(animation);
        }
    }, 25);
    // 让内部也随之滚动
    if (event.deltaY < 0) {
        //判断是否滚到头部
        if (this.storyOutterDOM.scrollTop === 0) {
            this._upStory();
        }
    } else if (event.deltaY > 0) {
        // 判断是否滚到底部
        var scrollTop = this.storyOutterDOM.scrollTop;
        var offsetHeight = this.storyOutterDOM.offsetHeight;
        var scrollHeight = this.storyOutterDOM.scrollHeight;

        if (scrollTop + offsetHeight + 1 >= scrollHeight) {
            this._downStory();
        }
    }
};

// 设置当前幻灯片
storyState.prototype._setCurrIndex = function (index, cb) {
    var _this3 = this;

    // 保护锁
    if (this.setCurrIndexBlock) {
        return;
    }
    this._setUINavPos(index);
    if (typeof index === "number") {
        if (this.curr === index) {
            this.stories[index].style.display = "block";
            this.setCurrIndexBlock = true;
            setTimeout(function () {
                _this3.stories[index].style.visibility = "visible";
                _this3.stories[index].style.opacity = "1";
                _this3.stories[index].style.left = "0px";
                _this3.setCurrIndexBlock = false;
            }, 250);
        } else {
            // 隐藏
            this.stories[this.curr].style.visibility = "hidden";
            this.stories[this.curr].style.opacity = "0";
            this.stories[this.curr].style.left = "-30px";

            this.setCurrIndexBlock = true;
            setTimeout(function () {
                // 隐藏
                _this3.stories[_this3.curr].style.display = "none";
                _this3.stories[index].style.display = "block";
                setTimeout(function () {
                    _this3.stories[index].style.visibility = "visible";
                    _this3.stories[index].style.opacity = "1";
                    _this3.stories[index].style.left = "0px";
                    _this3.setCurrIndexBlock = false;
                    _this3.curr = index;
                    if (typeof cb === "function") {
                        cb();
                    }
                }, 250);
            }, 250);
        }
    }
};

storyState.prototype._getCurrIndex = function (index) {
    return this.curr;
};

storyState.prototype._setUINavPos = function (index) {
    var selector = this.uiNavItems[0];
    selector.style.top = this.uiNavItems[index + 1].offsetTop - 6 + "px";
};

storyState.prototype._goStory = function (index) {
    if (index >= 0 && index < this.storiesLen) {
        this._setCurrIndex(index);
    }
};

storyState.prototype._upStory = function () {
    var _this4 = this;

    if (this._getCurrIndex() > 0) {
        this._setCurrIndex(this._getCurrIndex() - 1, function () {
            var offsetHeight = _this4.storyOutterDOM.offsetHeight;
            var scrollHeight = _this4.storyOutterDOM.scrollHeight;
            _this4.storyOutterDOM.scrollTop = scrollHeight - offsetHeight;
        });
    }
};

storyState.prototype._downStory = function () {
    var _this5 = this;

    if (this._getCurrIndex() < this.storiesLen - 1) {
        this._setCurrIndex(this._getCurrIndex() + 1, function () {
            _this5.storyOutterDOM.scrollTop = 0;
        });
    }
};

var _storyState = new storyState();

'use strict';

// loading中...
var loading = document.querySelector(".ui-loading");
window.onload = function () {
    loading.style.opacity = 0;
    setTimeout(function () {
        loading.parentElement.removeChild(loading);
    }, 750);
};

})));
//# sourceMappingURL=main.js.map
